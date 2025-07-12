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
	status: "PENDING" | "AVAILABLE" | "SWAPPED" | "DELETED";
	createdAt: string;
	user: {
		id: string;
		name: string;
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
