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

	setAuthTokenGetter(getter: () => Promise<string | null>) {
		console.log("Setting auth token getter in api service");
		this.getAccessToken = getter;
	}

	setSignOutFunction(signOutFn: () => void) {
		this.signOut = signOutFn;
	}

	private setupInterceptors(): void {
		console.log("Setting up interceptors");
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
				}

				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);

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
			const { status, data } = error.response;

			if (this.isStructuredBackendError(data)) {
				return this.handleStructuredError(data as any);
			}

			switch (status) {
				case 401:
					apiError.message = "Authentication required. Please log in again.";
					apiError.code = "UNAUTHORIZED";
					localStorage.removeItem("auth_token");
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
			apiError.message = "Network error. Please check your connection and try again.";
			apiError.code = "NETWORK_ERROR";
		} else {
			apiError.message = error.message || "An unexpected error occurred";
			apiError.code = "REQUEST_ERROR";
		}

		if (!this.isSilentError(apiError.code)) {
			console.error("API Error:", apiError);
		}

		return Promise.reject(apiError);
	}

	private isStructuredBackendError(data: any): boolean {
		return data && typeof data === "object" && "error" in data && "message" in data;
	}

	private handleStructuredError(errorData: { error: string; message: string; details?: any }): Promise<never> {
		const { error, message, details } = errorData;

		if (AUTH_ERROR_CODES.includes(error)) {
			localStorage.removeItem("auth_token");

			if (this.signOut) {
				this.signOut();
			}
			window.location.href = "/login";
		}

		const apiError: ApiError = {
			message: message,
			code: error,
			details: details,
		};

		return Promise.reject(apiError);
	}

	private isSilentError(code?: string): boolean {
		const silentErrors = ["NOT_FOUND", "UNAUTHORIZED"];
		return silentErrors.includes(code || "");
	}

	async get<T = any>(url: string, config?: any): Promise<T> {
		const response = await this.api.get<T>(url, config);
		return response.data;
	}

	async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
		const response = await this.api.post<T>(url, data, config);
		return response.data;
	}

	async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
		const response = await this.api.put<T>(url, data, config);
		return response.data;
	}

	async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
		const response = await this.api.patch<T>(url, data, config);
		return response.data;
	}

	async delete<T = any>(url: string, config?: any): Promise<T> {
		const response = await this.api.delete<T>(url, config);
		return response.data;
	}

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

	getAxiosInstance(): AxiosInstance {
		return this.api;
	}
}

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

export { ERROR_CODES };

export default apiService;
