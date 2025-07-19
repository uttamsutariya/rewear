import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/authorize.middleware";
import { prisma } from "../config/database";
import { sendSuccess } from "../utils/responses";
import { ItemStatus } from "@prisma/client";

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/stats
 * Get platform overview statistics
 * Simple counts for admin dashboard
 */
router.get("/stats", async (_req, res, next) => {
	try {
		const [totalUsers, itemStats] = await Promise.all([
			prisma.user.count(),

			// Items grouped by status
			prisma.item.groupBy({
				by: ["status"],
				_count: true,
			}),
		]);

		// Format item statistics
		const itemsByStatus = {
			total: 0,
			pending: 0,
			approved: 0,
			rejected: 0,
			available: 0,
			swapped: 0,
		};

		itemStats.forEach((stat) => {
			const status = stat.status.toLowerCase() as keyof typeof itemsByStatus;
			itemsByStatus[status] = stat._count;
			itemsByStatus.total += stat._count;
		});

		sendSuccess(res, {
			users: {
				total: totalUsers,
			},
			items: itemsByStatus,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/admin/items/pending
 * Get all items pending approval
 * Includes user details for moderation
 */
router.get("/items/pending", async (req, res, next) => {
	try {
		const { page = "1", limit = "20" } = req.query;
		const pageNum = parseInt(page as string);
		const limitNum = Math.min(parseInt(limit as string), 100);
		const skip = (pageNum - 1) * limitNum;

		const [items, total] = await Promise.all([
			prisma.item.findMany({
				where: { status: ItemStatus.PENDING },
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
					_count: {
						select: {
							swapRequests: true,
						},
					},
				},
				orderBy: { createdAt: "asc" },
				skip,
				take: limitNum,
			}),
			prisma.item.count({
				where: { status: ItemStatus.PENDING },
			}),
		]);

		sendSuccess(res, {
			items,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				pages: Math.ceil(total / limitNum),
			},
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/admin/items
 * Get all items with filters (more focused than /api/items/all)
 * Includes additional admin-specific data
 */
router.get("/items", async (req, res, next) => {
	try {
		const { page = "1", limit = "20", status, userId, search } = req.query;

		const pageNum = parseInt(page as string);
		const limitNum = Math.min(parseInt(limit as string), 100);
		const skip = (pageNum - 1) * limitNum;

		const where: any = {};

		if (status) {
			where.status = status as ItemStatus;
		}

		if (userId) {
			where.userId = userId as string;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search as string, mode: "insensitive" } },
				{ description: { contains: search as string, mode: "insensitive" } },
			];
		}

		const [items, total] = await Promise.all([
			prisma.item.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
					_count: {
						select: {
							swapRequests: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limitNum,
			}),
			prisma.item.count({ where }),
		]);

		sendSuccess(res, {
			items,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				pages: Math.ceil(total / limitNum),
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
