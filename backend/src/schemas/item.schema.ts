import { z } from "zod";
import { ItemStatus } from "@prisma/client";

const CATEGORIES = ["Men", "Women", "Kids", "Unisex"] as const;
const TYPES = ["Shirt", "Pants", "Dress", "Jacket", "Shoes", "Accessories", "Other"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"] as const;
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"] as const;

export const createItemSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.max(100, "Title must be less than 100 characters")
		.trim(),

	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description must be less than 1000 characters")
		.trim(),

	category: z.enum(CATEGORIES, {
		errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(", ")}` }),
	}),

	type: z.enum(TYPES, {
		errorMap: () => ({ message: `Type must be one of: ${TYPES.join(", ")}` }),
	}),

	size: z.enum(SIZES, {
		errorMap: () => ({ message: `Size must be one of: ${SIZES.join(", ")}` }),
	}),

	condition: z.enum(CONDITIONS, {
		errorMap: () => ({ message: `Condition must be one of: ${CONDITIONS.join(", ")}` }),
	}),

	tags: z
		.array(z.string().trim())
		.min(1, "At least one tag is required")
		.max(10, "Maximum 10 tags allowed")
		.refine(
			(tags) => tags.every((tag) => tag.length >= 2 && tag.length <= 20),
			"Each tag must be between 2 and 20 characters",
		),

	images: z
		.array(z.string().url("Invalid image URL"))
		.min(1, "At least one image is required")
		.max(5, "Maximum 5 images allowed")
		.refine(
			(urls) => urls.every((url) => url.startsWith("https://res.cloudinary.com/")),
			"All images must be from Cloudinary",
		),
});

export const updateItemSchema = createItemSchema.partial();

export const listItemsQuerySchema = z.object({
	category: z.enum(CATEGORIES).optional(),
	type: z.enum(TYPES).optional(),
	size: z.enum(SIZES).optional(),
	condition: z.enum(CONDITIONS).optional(),
	tags: z.union([z.string(), z.array(z.string())]).optional(),
	search: z.string().optional(),
	status: z.nativeEnum(ItemStatus).optional(),
	userId: z.string().uuid().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateItemStatusSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED"]),
	reason: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type UpdateItemStatusInput = z.infer<typeof updateItemStatusSchema>;

export const ITEM_CONSTANTS = {
	CATEGORIES,
	TYPES,
	SIZES,
	CONDITIONS,
} as const;
