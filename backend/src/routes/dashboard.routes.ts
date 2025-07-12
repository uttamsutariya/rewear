import { Router } from "express";
import { authenticate, requireAuth } from "../middleware/auth.middleware";
import { prisma } from "../config/database";
import { sendSuccess } from "../utils/responses";
import { SwapRequestStatus, ItemStatus } from "@prisma/client";

const router = Router();

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data for the authenticated user
 * Requires authentication
 */
router.get("/", authenticate, requireAuth, async (req, res, next) => {
	try {
		const userId = req.user!.id;

		// Fetch all data in parallel for performance
		const [userProfile, itemStats, swapStats, recentItems, pendingSwapRequests, recentPointTransactions] =
			await Promise.all([
				// User profile with points
				prisma.user.findUnique({
					where: { id: userId },
					select: {
						id: true,
						email: true,
						name: true,
						points: true,
						isAdmin: true,
						createdAt: true,
					},
				}),

				// Item statistics
				prisma.item.groupBy({
					by: ["status"],
					where: { userId },
					_count: true,
				}),

				// Swap statistics
				Promise.all([
					// Sent swap requests by status
					prisma.swapRequest.groupBy({
						by: ["status"],
						where: { requesterId: userId },
						_count: true,
					}),
					// Received swap requests by status
					prisma.swapRequest.groupBy({
						by: ["status"],
						where: { item: { userId } },
						_count: true,
					}),
					// Completed swaps count
					prisma.swap.count({
						where: {
							OR: [{ initiatorId: userId }, { receiverId: userId }],
						},
					}),
				]),

				// Recent items (last 5)
				prisma.item.findMany({
					where: { userId },
					orderBy: { createdAt: "desc" },
					take: 5,
					select: {
						id: true,
						title: true,
						images: true,
						status: true,
						createdAt: true,
						_count: {
							select: {
								swapRequests: {
									where: { status: SwapRequestStatus.PENDING },
								},
							},
						},
					},
				}),

				// Pending swap requests (both sent and received)
				prisma.swapRequest.findMany({
					where: {
						status: SwapRequestStatus.PENDING,
						OR: [{ requesterId: userId }, { item: { userId } }],
					},
					include: {
						item: {
							select: {
								id: true,
								title: true,
								images: true,
								userId: true,
							},
						},
						requester: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: 5,
				}),

				// Recent point transactions
				prisma.pointTransaction.findMany({
					where: { userId },
					include: {
						item: {
							select: {
								id: true,
								title: true,
								images: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: 5,
				}),
			]);

		// Process item statistics
		const itemStatsMap = itemStats.reduce(
			(acc, stat) => {
				acc[stat.status] = stat._count;
				return acc;
			},
			{} as Record<string, number>,
		);

		// Process swap statistics
		const [sentRequests, receivedRequests, completedSwaps] = swapStats;

		const sentRequestsMap = sentRequests.reduce(
			(acc, stat) => {
				acc[stat.status] = stat._count;
				return acc;
			},
			{} as Record<string, number>,
		);

		const receivedRequestsMap = receivedRequests.reduce(
			(acc, stat) => {
				acc[stat.status] = stat._count;
				return acc;
			},
			{} as Record<string, number>,
		);

		// Build dashboard response
		const dashboardData = {
			profile: userProfile,

			stats: {
				items: {
					total: Object.values(itemStatsMap).reduce((sum, count) => sum + count, 0),
					pending: itemStatsMap[ItemStatus.PENDING] || 0,
					available: itemStatsMap[ItemStatus.AVAILABLE] || 0,
					swapped: itemStatsMap[ItemStatus.SWAPPED] || 0,
					rejected: itemStatsMap[ItemStatus.REJECTED] || 0,
				},
				swaps: {
					sent: {
						total: Object.values(sentRequestsMap).reduce((sum, count) => sum + count, 0),
						pending: sentRequestsMap[SwapRequestStatus.PENDING] || 0,
						accepted: sentRequestsMap[SwapRequestStatus.ACCEPTED] || 0,
						rejected: sentRequestsMap[SwapRequestStatus.REJECTED] || 0,
					},
					received: {
						total: Object.values(receivedRequestsMap).reduce((sum, count) => sum + count, 0),
						pending: receivedRequestsMap[SwapRequestStatus.PENDING] || 0,
						accepted: receivedRequestsMap[SwapRequestStatus.ACCEPTED] || 0,
						rejected: receivedRequestsMap[SwapRequestStatus.REJECTED] || 0,
					},
					completed: completedSwaps,
				},
				points: {
					current: userProfile?.points || 0,
					totalEarned: recentPointTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
					totalRedeemed: Math.abs(
						recentPointTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
					),
				},
			},

			recentActivity: {
				items: recentItems.map((item) => ({
					...item,
					pendingRequests: item._count.swapRequests,
				})),
				swapRequests: pendingSwapRequests.map((request) => ({
					...request,
					isPointRedemption: !request.offeredItemId,
					isSent: request.requesterId === userId,
					isReceived: request.item.userId === userId,
				})),
				pointTransactions: recentPointTransactions.map((transaction) => ({
					...transaction,
					isEarned: transaction.amount > 0,
				})),
			},

			quickActions: {
				hasPendingItems: itemStatsMap[ItemStatus.PENDING] > 0,
				hasPendingRequestsToRespond: receivedRequestsMap[SwapRequestStatus.PENDING] > 0,
				canRedeemItems: (userProfile?.points || 0) >= 10, // Minimum points for cheapest items
			},
		};

		sendSuccess(res, dashboardData);
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/dashboard/summary
 * Get a simplified summary for the user
 * Requires authentication
 */
router.get("/summary", authenticate, requireAuth, async (req, res, next) => {
	try {
		const userId = req.user!.id;

		const [itemCount, swapCount, pendingCount] = await Promise.all([
			// Total available items
			prisma.item.count({
				where: {
					userId,
					status: ItemStatus.AVAILABLE,
				},
			}),

			// Total completed swaps
			prisma.swap.count({
				where: {
					OR: [{ initiatorId: userId }, { receiverId: userId }],
				},
			}),

			// Pending requests to respond to
			prisma.swapRequest.count({
				where: {
					item: { userId },
					status: SwapRequestStatus.PENDING,
				},
			}),
		]);

		sendSuccess(res, {
			points: req.user!.points,
			availableItems: itemCount,
			completedSwaps: swapCount,
			pendingRequests: pendingCount,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
