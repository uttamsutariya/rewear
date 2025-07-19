import { Router } from "express";
import { authenticate, requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validation.middleware";
import { ItemService } from "../services/item.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/responses";
import {
	createItemSchema,
	updateItemSchema,
	listItemsQuerySchema,
	updateItemStatusSchema,
	ITEM_CONSTANTS,
} from "../schemas/item.schema";

const router = Router();

/**
 * GET /api/items/constants
 * Get item constants (categories, types, sizes, conditions)
 * Public endpoint
 */
router.get("/constants", (_req, res) => {
	sendSuccess(res, ITEM_CONSTANTS);
});

/**
 * GET /api/items/featured
 * Get featured items for homepage
 * Public endpoint
 */
router.get("/featured", async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit as string) || 10;
		const items = await ItemService.getFeaturedItems(limit);
		sendSuccess(res, items);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/items
 * List items with filtering, pagination, and search
 * Public endpoint (shows only available items)
 */
router.get("/", validate(listItemsQuerySchema, "query"), async (req, res, next) => {
	try {
		const result = await ItemService.listItems(req.query as any, true);
		sendSuccess(res, result);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/items/all
 * List all items (including pending/rejected)
 * Admin only
 */
router.get("/all", authenticate, requireAdmin, validate(listItemsQuerySchema, "query"), async (req, res, next) => {
	try {
		const result = await ItemService.listItems(req.query as any, false);
		sendSuccess(res, result);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/items/user/:userId
 * Get items by a specific user
 * Public endpoint (shows only available items unless owner/admin)
 */
router.get("/user/:userId", authenticate, async (req, res, next) => {
	try {
		const { userId } = req.params;
		const items = await ItemService.getItemsByUser(userId, req.user!.id, req.user!.isAdmin);
		sendSuccess(res, items);
	} catch (error) {
		next(error);
	}
});

/**
 * POST /api/items
 * Create a new item
 * Requires authentication
 */
router.post("/", authenticate, requireAuth, validate(createItemSchema), async (req, res, next) => {
	try {
		const item = await ItemService.createItem(req.user!.id, req.body);
		sendCreated(res, item, "Item created successfully. It will be available after admin approval.");
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/items/:id
 * Get a single item by ID
 * Public endpoint with optional authentication
 */
router.get("/:id", authenticate, async (req, res, next) => {
	try {
		const { id } = req.params;
		const item = await ItemService.getItemById(id);

		if (item.status !== "AVAILABLE") {
			if (!req.user || (req.user.id !== item.userId && !req.user.isAdmin)) {
				return sendSuccess(res, null, "Item not found");
			}
		}

		sendSuccess(res, item);
		return;
	} catch (err) {
		next(err);
		return;
	}
});

/**	
 * PUT /api/items/:id
 * Update an item
 * Requires authentication and ownership (or admin)
 */
router.put("/:id", authenticate, requireAuth, validate(updateItemSchema), async (req, res, next) => {
	try {
		const { id } = req.params;
		const item = await ItemService.updateItem(id, req.user!.id, req.body, req.user!.isAdmin);
		sendSuccess(res, item, "Item updated successfully");
		return;
	} catch (err) {
		next(err);
		return;
	}
});

/**
 * DELETE /api/items/:id
 * Delete an item
 * Requires authentication and ownership (or admin)
 */
router.delete("/:id", authenticate, requireAuth, async (req, res, next) => {
	try {
		const { id } = req.params;
		await ItemService.deleteItem(id, req.user!.id, req.user!.isAdmin);
		sendNoContent(res);
		return;
	} catch (err) {
		next(err);
		return;
	}
});

/**
 * POST /api/items/:id/approve
 * Approve an item
 * Admin only
 */
router.post("/:id/approve", authenticate, requireAdmin, async (req, res, next) => {
	try {
		const { id } = req.params;
		const item = await ItemService.updateItemStatus(id, { status: "APPROVED" });
		sendSuccess(res, item, "Item approved successfully");
	} catch (error) {
		next(error);
	}
});

/**
 * POST /api/items/:id/reject
 * Reject an item
 * Admin only
 */
router.post(
	"/:id/reject",
	authenticate,
	requireAdmin,
	validate(updateItemStatusSchema.pick({ reason: true })),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const item = await ItemService.updateItemStatus(id, {
				status: "REJECTED",
				reason: req.body.reason,
			});
			sendSuccess(res, item, "Item rejected");
		} catch (error) {
			next(error);
		}
	},
);

export default router;
