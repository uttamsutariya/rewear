import { Router } from "express";
import { authenticate, requireAuth } from "../middleware/auth.middleware";
import { sendSuccess } from "../utils/responses";
import { prisma } from "../config/database";
import { NotFoundError } from "../utils/errors";

const router = Router();

/**
 * GET /api/users/profile
 * Get current user's full profile
 */
router.get("/profile", authenticate, requireAuth, async (req, res, next) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.id },
			select: {
				id: true,
				email: true,
				name: true,
				points: true,
				isAdmin: true,
				createdAt: true,
				_count: {
					select: {
						items: true,
						initiatedSwaps: true,
						receivedSwaps: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		sendSuccess(res, {
			...user,
			stats: {
				itemsListed: user._count.items,
				swapsInitiated: user._count.initiatedSwaps,
				swapsReceived: user._count.receivedSwaps,
			},
			_count: undefined,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/users/:id
 * Get a specific user's public profile
 */
router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				createdAt: true,
				_count: {
					select: {
						items: {
							where: { status: "AVAILABLE" },
						},
						initiatedSwaps: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		sendSuccess(res, {
			...user,
			stats: {
				itemsAvailable: user._count.items,
				totalSwaps: user._count.initiatedSwaps,
			},
			_count: undefined,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
