import { Router } from "express";
import { authenticate, requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { PointsService } from "../services/points.service";
import { sendSuccess } from "../utils/responses";
import { listPointTransactionsQuerySchema } from "../schemas/swap.schema";

const router = Router();

/**
 * GET /api/points/transactions
 * Get user's point transaction history
 * Requires authentication
 */
router.get(
	"/transactions",
	authenticate,
	requireAuth,
	validate(listPointTransactionsQuerySchema, "query"),
	async (req, res, next) => {
		try {
			const { type, page, limit } = req.query as any;

			const result = await PointsService.getUserPointTransactions(req.user!.id, type, page, limit);

			sendSuccess(res, result);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * GET /api/points/balance
 * Get user's current points balance
 * Requires authentication
 */
router.get("/balance", authenticate, requireAuth, async (req, res, next) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.id },
			select: { points: true },
		});

		sendSuccess(res, {
			points: user?.points || 0,
			userId: req.user!.id,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/points/leaderboard
 * Get points leaderboard
 * Public endpoint
 */
router.get("/leaderboard", async (req, res, next) => {
	try {
		const limit = parseInt(req.query.limit as string) || 10;
		const leaderboard = await PointsService.getPointsLeaderboard(limit);

		sendSuccess(res, leaderboard);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/points/calculate/:itemId
 * Calculate points value for an item
 * Public endpoint
 */
router.get("/calculate/:itemId", async (req, res, next) => {
	try {
		const item = await prisma.item.findUnique({
			where: { id: req.params.itemId },
			select: { condition: true },
		});

		if (!item) {
			return sendSuccess(res, { points: 0, error: "Item not found" });
		}

		const points = PointsService.calculateItemPoints(item.condition);

		sendSuccess(res, {
			itemId: req.params.itemId,
			condition: item.condition,
			points,
		});
	} catch (error) {
		next(error);
	}
});

// Import prisma here to avoid circular dependency
import { prisma } from "../config/database";

export default router;
