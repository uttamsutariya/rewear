export interface User {
	id: string;
	email: string;
	name: string;
	points: number;
	isAdmin: boolean;
	createdAt?: string;
}

export interface Item {
	id: string;
	title: string;
	description: string;
	category: string;
	type: string;
	size: string;
	condition: string;
	tags: string[];
	images: string[];
	status: "PENDING" | "AVAILABLE" | "SWAPPED" | "REJECTED";
	createdAt: string;
	userId?: string;
	user: {
		id: string;
		name: string;
		email?: string;
	};
}

export interface FeaturedItem {
	id: string;
	title: string;
	images: string[];
	size: string;
	user: {
		id: string;
		name: string;
	};
}

export interface ItemConstants {
	categories: string[];
	types: Record<string, string[]>;
	sizes: string[];
	conditions: string[];
}

export interface SwapRequest {
	id: string;
	requesterId: string;
	itemId: string;
	offeredItemId?: string;
	status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
	isPointRedemption: boolean;
	createdAt: string;
	item: Item;
	offeredItem?: Item;
	requester: User;
}

export interface SwapRequestListItem {
	id: string;
	status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
	isPointRedemption: boolean;
	isSent: boolean;
	isReceived: boolean;
	createdAt: string;
	item: Item;
	offeredItem?: Item;
	requester: User;
}

export interface PointTransaction {
	id: string;
	amount: number;
	type: "EARNED" | "REDEEMED";
	createdAt: string;
	isEarned?: boolean;
	item?: {
		id: string;
		title: string;
		images: string[];
	};
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface DashboardData {
	profile: User;
	stats: {
		items: {
			total: number;
			pending: number;
			available: number;
			swapped: number;
			rejected: number;
		};
		swaps: {
			sent: {
				total: number;
				pending: number;
				accepted: number;
				rejected: number;
			};
			received: {
				total: number;
				pending: number;
				accepted: number;
				rejected: number;
			};
			completed: number;
		};
		points: {
			current: number;
			totalEarned: number;
			totalRedeemed: number;
		};
	};
	recentActivity: {
		items: Array<Item & { pendingRequests?: number }>;
		swapRequests: SwapRequestListItem[];
		pointTransactions: PointTransaction[];
	};
	quickActions: {
		hasPendingItems: boolean;
		hasPendingRequestsToRespond: boolean;
		canRedeemItems: boolean;
	};
}
