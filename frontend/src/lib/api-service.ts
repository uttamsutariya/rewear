import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

export interface ApiResponse<T = any> {
	success: boolean;
	data: T;
	message?: string;
}

export interface ApiError {
	message: string;
	code?: string;
	details?: any;
}

class ApiService {
	private api: AxiosInstance;
	private readonly baseURL: string;
	private getAccessToken: (() => Promise<string | null>) | null = null;
	private signOut: (() => void) | null = null;

	constructor() {
		this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

		// Create axios instance with base configuration
		this.api = axios.create({
			baseURL: this.baseURL + "/api",
			timeout: 30000, // 30 seconds timeout
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});

		this.setupInterceptors();
	}

	// Method to set the getAccessToken function from WorkOS
	setAuthTokenGetter(getter: () => Promise<string | null>) {
		console.log("Setting auth token getter in api service");
		this.getAccessToken = getter;
	}

	// Method to set the signOut function from WorkOS
	setSignOutFunction(signOutFn: () => void) {
		this.signOut = signOutFn;
	}

	private setupInterceptors(): void {
		console.log("Setting up interceptors");
		// Request interceptor - automatically add auth token
		this.api.interceptors.request.use(
			async (config) => {
				try {
					if (this.getAccessToken) {
						const token = await this.getAccessToken();
						console.log("Token:", token);
						if (token) {
							config.headers.Authorization = `Bearer ${token}`;
						}
					} else {
						// For now, check localStorage as fallback
						const token = localStorage.getItem("auth_token");
						if (token) {
							config.headers.Authorization = `Bearer ${token}`;
						}
					}
				} catch (error) {
					console.warn("Failed to get auth token:", error);
					// Continue with request even if token fetch fails
				}

				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);

		// Response interceptor - handle common responses and errors
		this.api.interceptors.response.use(
			(response: AxiosResponse) => {
				return response;
			},
			(error: AxiosError) => {
				return this.handleApiError(error);
			},
		);
	}

	private handleApiError(error: AxiosError): Promise<never> {
		const apiError: ApiError = {
			message: "An unexpected error occurred",
			code: "UNKNOWN_ERROR",
		};

		if (error.response) {
			// Server responded with error status
			const { status, data } = error.response;

			// Check if this is a structured backend error
			if (this.isStructuredBackendError(data)) {
				return this.handleStructuredError(data as any);
			}

			// Handle regular HTTP errors (non-structured)
			switch (status) {
				case 401:
					apiError.message = "Authentication required. Please log in again.";
					apiError.code = "UNAUTHORIZED";
					// Clear stored token
					localStorage.removeItem("auth_token");
					// Redirect to login page if we have signOut function
					if (this.signOut) {
						this.signOut();
					}
					window.location.href = "/login";
					break;
				case 403:
					apiError.message = "You do not have permission to perform this action.";
					apiError.code = "FORBIDDEN";
					break;
				case 404:
					apiError.message = "The requested resource was not found.";
					apiError.code = "NOT_FOUND";
					break;
				case 422:
					apiError.message = "Validation error. Please check your input.";
					apiError.code = "VALIDATION_ERROR";
					apiError.details = data;
					break;
				case 429:
					apiError.message = "Too many requests. Please try again later.";
					apiError.code = "RATE_LIMITED";
					break;
				case 500:
					apiError.message = "Internal server error. Please try again later.";
					apiError.code = "SERVER_ERROR";
					break;
				default:
					apiError.message = (data as any)?.message || `Request failed with status ${status}`;
					apiError.code = `HTTP_${status}`;
			}

			apiError.details = data;
		} else if (error.request) {
			// Network error
			apiError.message = "Network error. Please check your connection and try again.";
			apiError.code = "NETWORK_ERROR";
		} else {
			// Other error
			apiError.message = error.message || "An unexpected error occurred";
			apiError.code = "REQUEST_ERROR";
		}

		// Show toast notification for user-facing errors
		if (!this.isSilentError(apiError.code)) {
			// TODO: Implement toast notifications
			console.error("API Error:", apiError);
		}

		return Promise.reject(apiError);
	}

	private isStructuredBackendError(data: any): boolean {
		// Check if response has structured error format from backend
		return data && typeof data === "object" && "error" in data && "message" in data;
	}

	private handleStructuredError(errorData: { error: string; message: string; details?: any }): Promise<never> {
		const { error, message, details } = errorData;

		// Check if this is an authentication error that requires logout
		if (AUTH_ERROR_CODES.includes(error)) {
			// Clear stored token
			localStorage.removeItem("auth_token");

			// Properly logout user and redirect to login
			if (this.signOut) {
				this.signOut();
			}
			window.location.href = "/login";
		}

		// Create API error for rejection
		const apiError: ApiError = {
			message: message,
			code: error,
			details: details,
		};

		return Promise.reject(apiError);
	}

	private isSilentError(code?: string): boolean {
		// Define which errors should not show toast notifications
		const silentErrors = ["NOT_FOUND", "UNAUTHORIZED"];
		return silentErrors.includes(code || "");
	}

	// Generic GET request
	async get<T = any>(url: string, config?: any): Promise<T> {
		const response = await this.api.get<T>(url, config);
		return response.data;
	}

	// Generic POST request
	async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
		const response = await this.api.post<T>(url, data, config);
		return response.data;
	}

	// Generic PUT request
	async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
		const response = await this.api.put<T>(url, data, config);
		return response.data;
	}

	// Generic PATCH request
	async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
		const response = await this.api.patch<T>(url, data, config);
		return response.data;
	}

	// Generic DELETE request
	async delete<T = any>(url: string, config?: any): Promise<T> {
		const response = await this.api.delete<T>(url, config);
		return response.data;
	}

	// File upload with multipart/form-data
	async upload<T = any>(url: string, formData: FormData, config?: any): Promise<T> {
		const response = await this.api.post<T>(url, formData, {
			...config,
			headers: {
				...config?.headers,
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	}

	// Get the raw axios instance if needed for advanced usage
	getAxiosInstance(): AxiosInstance {
		return this.api;
	}
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Error codes from backend
const ERROR_CODES = {
	// Authentication errors (401)
	INVALID_TOKEN: "INVALID_TOKEN",
	MISSING_TOKEN: "MISSING_TOKEN",
	TOKEN_EXPIRED: "TOKEN_EXPIRED",

	// Authorization errors (403)
	FORBIDDEN: "FORBIDDEN",
	ADMIN_ONLY: "ADMIN_ONLY",

	// Validation errors (422)
	VALIDATION_ERROR: "VALIDATION_ERROR",
	INVALID_INPUT: "INVALID_INPUT",

	// Business logic errors
	INSUFFICIENT_POINTS: "INSUFFICIENT_POINTS",
	ITEM_NOT_AVAILABLE: "ITEM_NOT_AVAILABLE",
	DUPLICATE_REQUEST: "DUPLICATE_REQUEST",

	// Server errors (500)
	DATABASE_ERROR: "DATABASE_ERROR",
	WORKOS_SERVICE_ERROR: "WORKOS_SERVICE_ERROR",

	// Rate limiting (429)
	RATE_LIMITED: "RATE_LIMITED",
};

// Error codes that require logout
const AUTH_ERROR_CODES = [ERROR_CODES.INVALID_TOKEN, ERROR_CODES.MISSING_TOKEN, ERROR_CODES.TOKEN_EXPIRED];

// Export types and constants
export { ERROR_CODES };

// Export the instance as default for convenience
export default apiService;
