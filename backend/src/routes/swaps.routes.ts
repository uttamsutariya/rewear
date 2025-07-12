import { Router } from "express";
import { authenticate, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { SwapService } from "../services/swap.service";
import { sendSuccess, sendCreated } from "../utils/responses";
import {
	createSwapRequestSchema,
	createPointRedemptionSchema,
	respondToSwapRequestSchema,
	listSwapRequestsQuerySchema,
} from "../schemas/swap.schema";

const router = Router();

/**
 * POST /api/swaps/requests
 * Create a swap request (direct swap with offered item)
 * Requires authentication
 */
router.post("/requests", authenticate, requireAuth, validate(createSwapRequestSchema), async (req, res, next) => {
	try {
		const swapRequest = await SwapService.createSwapRequest(req.user!.id, req.body);

		sendCreated(
			res,
			swapRequest,
			req.body.offeredItemId ? "Swap request created successfully" : "Point redemption request created successfully",
		);
	} catch (error) {
		next(error);
	}
});

/**
 * POST /api/swaps/redeem
 * Create a point redemption request
 * Requires authentication
 */
router.post("/redeem", authenticate, requireAuth, validate(createPointRedemptionSchema), async (req, res, next) => {
	try {
		const swapRequest = await SwapService.createPointRedemption(req.user!.id, req.body);

		sendCreated(res, swapRequest, "Redemption request created successfully");
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/swaps/requests
 * List user's swap requests (sent and received)
 * Requires authentication
 */
router.get(
	"/requests",
	authenticate,
	requireAuth,
	validate(listSwapRequestsQuerySchema, "query"),
	async (req, res, next) => {
		try {
			const result = await SwapService.listSwapRequests(req.user!.id, req.query as any);

			sendSuccess(res, result);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * GET /api/swaps/requests/:id
 * Get swap request details
 * Requires authentication and involvement in the request
 */
router.get("/requests/:id", authenticate, requireAuth, async (req, res, next) => {
	try {
		const swapRequest = await SwapService.getSwapRequestDetails(req.params.id, req.user!.id);

		sendSuccess(res, swapRequest);
	} catch (error) {
		next(error);
	}
});

/**
 * POST /api/swaps/requests/:id/respond
 * Accept or reject a swap request
 * Requires authentication and ownership of the requested item
 */
router.post(
	"/requests/:id/respond",
	authenticate,
	requireAuth,
	validate(respondToSwapRequestSchema),
	async (req, res, next) => {
		try {
			const result = await SwapService.respondToSwapRequest(req.params.id, req.user!.id, req.body);

			const message = req.body.action === "accept" ? "Swap request accepted successfully" : "Swap request rejected";

			sendSuccess(res, result, message);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * POST /api/swaps/requests/:id/cancel
 * Cancel a pending swap request
 * Requires authentication and must be the requester
 */
router.post("/requests/:id/cancel", authenticate, requireAuth, async (req, res, next) => {
	try {
		const swapRequest = await SwapService.cancelSwapRequest(req.params.id, req.user!.id);

		sendSuccess(res, swapRequest, "Swap request cancelled");
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/swaps/history
 * Get user's swap history (completed swaps)
 * Requires authentication
 */
router.get("/history", authenticate, requireAuth, async (req, res, next) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;

		const result = await SwapService.getSwapHistory(req.user!.id, page, limit);

		sendSuccess(res, result);
	} catch (error) {
		next(error);
	}
});

// Simplified endpoints for backward compatibility
/**
 * POST /api/swaps/requests/:id/accept
 * Accept a swap request (simplified endpoint)
 */
router.post("/requests/:id/accept", authenticate, requireAuth, async (req, res, next) => {
	try {
		const result = await SwapService.respondToSwapRequest(req.params.id, req.user!.id, { action: "accept" });

		sendSuccess(res, result, "Swap request accepted successfully");
	} catch (error) {
		next(error);
	}
});

/**
 * POST /api/swaps/requests/:id/reject
 * Reject a swap request (simplified endpoint)
 */
router.post("/requests/:id/reject", authenticate, requireAuth, async (req, res, next) => {
	try {
		const result = await SwapService.respondToSwapRequest(req.params.id, req.user!.id, {
			action: "reject",
			message: req.body.message,
		});

		sendSuccess(res, result, "Swap request rejected");
	} catch (error) {
		next(error);
	}
});

export default router;
