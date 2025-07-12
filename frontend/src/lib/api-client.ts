import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access
			localStorage.removeItem("auth_token");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

// API endpoints
export const api = {
	items: {
		getFeatured: () => apiClient.get("/items/featured"),
		getAll: (params?: any) => apiClient.get("/items", { params }),
		getById: (id: string) => apiClient.get(`/items/${id}`),
		getConstants: () => apiClient.get("/items/constants"),
	},
	auth: {
		me: () => apiClient.get("/auth/me"),
		logout: () => apiClient.post("/auth/logout"),
	},
	users: {
		getProfile: () => apiClient.get("/users/profile"),
		getById: (id: string) => apiClient.get(`/users/${id}`),
	},
};
