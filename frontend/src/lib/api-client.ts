import { apiService } from "./api-service";
import type {
	ApiResponse,
	Item,
	User,
	FeaturedItem,
	ItemConstants,
	SwapRequest,
	SwapRequestListItem,
	PointTransaction,
	DashboardData,
	PaginatedResponse,
} from "../types";

export const api = {
	auth: {
		me: () => apiService.get<ApiResponse<{ user: User }>>("/auth/me"),
		logout: () => apiService.post<ApiResponse<{ message: string }>>("/auth/logout"),
	},

	users: {
		profile: () => apiService.get<ApiResponse<User>>("/users/profile"),
		getById: (id: string) => apiService.get<ApiResponse<User>>(`/users/${id}`),
	},

	upload: {
		images: (formData: FormData) =>
			apiService.upload<ApiResponse<{ urls: string[]; count: number; message: string }>>("/upload/images", formData),
	},

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

		// Get user's available items for swap
		getUserAvailableItems: () =>
			apiService.get<ApiResponse<{ items: Item[] }>>("/items", {
				params: { status: "AVAILABLE", userId: "current", limit: 100 },
			}),
	},

	swaps: {
		createRequest: (data: { itemId: string; offeredItemId: string; message?: string }) =>
			apiService.post<ApiResponse<SwapRequest>>("/swaps/requests", data),

		redeem: (data: { itemId: string }) => apiService.post<ApiResponse<SwapRequest>>("/swaps/redeem", data),

		listRequests: (params?: {
			type?: "sent" | "received" | "all";
			status?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
			page?: number;
			limit?: number;
		}) =>
			apiService.get<
				ApiResponse<{
					requests: SwapRequestListItem[];
					pagination: {
						page: number;
						limit: number;
						total: number;
						totalPages: number;
					};
				}>
			>("/swaps/requests", { params }),

		getRequestById: (id: string) => apiService.get<ApiResponse<SwapRequest>>(`/swaps/requests/${id}`),

		respond: (id: string, action: "accept" | "reject", message?: string) =>
			apiService.post<ApiResponse<SwapRequest>>(`/swaps/requests/${id}/respond`, { action, message }),

		cancel: (id: string) => apiService.post<ApiResponse<{ message: string }>>(`/swaps/requests/${id}/cancel`),

		history: (params?: { page?: number; limit?: number }) =>
			apiService.get<ApiResponse<any[]>>("/swaps/history", { params }),
	},

	points: {
		balance: () => apiService.get<ApiResponse<{ balance: number }>>("/points/balance"),
		transactions: (params?: { type?: "earned" | "redeemed" | "all"; page?: number; limit?: number }) =>
			apiService.get<
				ApiResponse<{
					transactions: PointTransaction[];
					summary: {
						totalEarned: number;
						totalRedeemed: number;
						currentBalance: number;
					};
					pagination: {
						page: number;
						limit: number;
						total: number;
						totalPages: number;
					};
				}>
			>("/points/transactions", { params }),
		leaderboard: () => apiService.get<ApiResponse<any[]>>("/points/leaderboard"),
		calculate: (itemId: string) =>
			apiService.get<ApiResponse<{ points: number; condition: string }>>(`/points/calculate/${itemId}`),
	},

	dashboard: {
		get: () => apiService.get<ApiResponse<DashboardData>>("/dashboard"),
		summary: () => apiService.get<ApiResponse<any>>("/dashboard/summary"),
	},

	admin: {
		stats: () => apiService.get<ApiResponse<any>>("/admin/stats"),
		pendingItems: (params?: { page?: number; limit?: number }) =>
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
			>("/admin/items/pending", { params }),
	},
};

export { apiService as apiClient } from "./api-service";
