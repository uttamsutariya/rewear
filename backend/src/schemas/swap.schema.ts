import { z } from "zod";
import { SwapRequestStatus } from "@prisma/client";

export const createSwapRequestSchema = z.object({
	itemId: z.string().uuid("Invalid item ID"),
	offeredItemId: z.string().uuid("Invalid offered item ID").optional(),
	message: z.string().max(500, "Message must be less than 500 characters").optional(),
});

export const createPointRedemptionSchema = z.object({
	itemId: z.string().uuid("Invalid item ID"),
});

export const respondToSwapRequestSchema = z.object({
	action: z.enum(["accept", "reject"]),
	message: z.string().max(500, "Message must be less than 500 characters").optional(),
});

export const listSwapRequestsQuerySchema = z.object({
	type: z.enum(["sent", "received", "all"]).default("all"),
	status: z.nativeEnum(SwapRequestStatus).optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export const listPointTransactionsQuerySchema = z.object({
	type: z.enum(["earned", "redeemed", "all"]).default("all"),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateSwapRequestInput = z.infer<typeof createSwapRequestSchema>;
export type CreatePointRedemptionInput = z.infer<typeof createPointRedemptionSchema>;
export type RespondToSwapRequestInput = z.infer<typeof respondToSwapRequestSchema>;
export type ListSwapRequestsQuery = z.infer<typeof listSwapRequestsQuerySchema>;
export type ListPointTransactionsQuery = z.infer<typeof listPointTransactionsQuerySchema>;
