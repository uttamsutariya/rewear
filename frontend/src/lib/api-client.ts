import { apiService } from "./api-service";
import type { ApiResponse, Item, User, FeaturedItem, ItemConstants } from "../types";

// Auth APIs
export const api = {
	auth: {
		me: () => apiService.get<ApiResponse<{ user: User }>>("/auth/me"),
		logout: () => apiService.post<ApiResponse<{ message: string }>>("/auth/logout"),
	},

	// User APIs
	users: {
		profile: () => apiService.get<ApiResponse<User>>("/users/profile"),
		getById: (id: string) => apiService.get<ApiResponse<User>>(`/users/${id}`),
	},

	// Upload APIs
	upload: {
		images: (formData: FormData) =>
			apiService.upload<ApiResponse<{ urls: string[]; count: number; message: string }>>("/upload/images", formData),
	},

	// Item APIs
	items: {
		getConstants: () => apiService.get<ApiResponse<ItemConstants>>("/items/constants"),
		getFeatured: () => apiService.get<ApiResponse<FeaturedItem[]>>("/items/featured"),
		list: (params?: {
			page?: number;
			limit?: number;
			category?: string;
			type?: string;
			size?: string;
			condition?: string;
			search?: string;
			sortBy?: string;
			sortOrder?: "asc" | "desc";
		}) =>
			apiService.get<
				ApiResponse<{
					items: Item[];
					pagination: {
						page: number;
						limit: number;
						total: number;
						pages: number;
					};
				}>
			>("/items", { params }),

		create: (data: {
			title: string;
			description: string;
			category: string;
			type: string;
			size: string;
			condition: string;
			tags: string[];
			images: string[];
		}) => apiService.post<ApiResponse<Item>>("/items", data),

		getById: (id: string) => apiService.get<ApiResponse<Item>>(`/items/${id}`),
		update: (id: string, data: Partial<Item>) => apiService.put<ApiResponse<Item>>(`/items/${id}`, data),
		delete: (id: string) => apiService.delete<ApiResponse<{ message: string }>>(`/items/${id}`),

		// Admin actions
		approve: (id: string) => apiService.post<ApiResponse<Item>>(`/items/${id}/approve`),
		reject: (id: string, reason: string) => apiService.post<ApiResponse<Item>>(`/items/${id}/reject`, { reason }),
	},

	// Swap APIs
	swaps: {
		createRequest: (data: { itemId: string; offeredItemId: string }) =>
			apiService.post<ApiResponse<any>>("/swaps/requests", data),

		redeem: (data: { itemId: string }) => apiService.post<ApiResponse<any>>("/swaps/redeem", data),

		listRequests: (params?: {
			type?: "sent" | "received";
			status?: "pending" | "accepted" | "rejected" | "cancelled";
		}) => apiService.get<ApiResponse<any[]>>("/swaps/requests", { params }),

		respond: (id: string, action: "accept" | "reject") =>
			apiService.post<ApiResponse<any>>(`/swaps/requests/${id}/respond`, { action }),

		history: () => apiService.get<ApiResponse<any[]>>("/swaps/history"),
	},

	// Points APIs
	points: {
		balance: () => apiService.get<ApiResponse<{ balance: number }>>("/points/balance"),
		transactions: () => apiService.get<ApiResponse<any[]>>("/points/transactions"),
		leaderboard: () => apiService.get<ApiResponse<any[]>>("/points/leaderboard"),
		calculate: (itemId: string) =>
			apiService.get<ApiResponse<{ points: number; condition: string }>>(`/points/calculate/${itemId}`),
	},

	// Dashboard API
	dashboard: {
		get: () => apiService.get<ApiResponse<any>>("/dashboard"),
	},

	// Admin APIs
	admin: {
		stats: () => apiService.get<ApiResponse<any>>("/admin/stats"),
		pendingItems: (params?: { page?: number; limit?: number }) =>
			apiService.get<ApiResponse<any>>("/admin/items/pending", { params }),
	},
};

// Export for backward compatibility
export { apiService as apiClient } from "./api-service";
