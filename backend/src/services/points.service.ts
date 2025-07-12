import { prisma } from "../config/database";
import { TransactionType } from "@prisma/client";
import { ValidationError } from "../utils/errors";

export class PointsService {
	// Points calculation based on item condition
	private static readonly POINTS_BY_CONDITION: Record<string, number> = {
		New: 50,
		"Like New": 40,
		Good: 30,
		Fair: 20,
		Poor: 10,
	};

	/**
	 * Calculate points value for an item based on its condition
	 * @param condition - The item condition
	 * @returns Points value
	 */
	static calculateItemPoints(condition: string): number {
		return this.POINTS_BY_CONDITION[condition] || 30; // Default to 30 if condition not found
	}

	/**
	 * Check if user has enough points for redemption
	 * @param userId - The user ID
	 * @param requiredPoints - Points required
	 * @returns Whether user has enough points
	 */
	static async checkUserPoints(userId: string, requiredPoints: number): Promise<boolean> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { points: true },
		});

		if (!user) {
			throw new ValidationError("User not found");
		}

		return user.points >= requiredPoints;
	}

	/**
	 * Award points to a user when their item is taken
	 * @param userId - The user ID to award points to
	 * @param itemId - The item that was taken
	 * @param points - Points to award
	 * @returns Updated user points balance
	 */
	static async awardPoints(userId: string, itemId: string, points: number): Promise<number> {
		// Create point transaction
		await prisma.pointTransaction.create({
			data: {
				userId,
				itemId,
				amount: points,
				type: TransactionType.EARNED,
			},
		});

		// Update user points balance
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				points: {
					increment: points,
				},
			},
			select: { points: true },
		});

		return updatedUser.points;
	}

	/**
	 * Deduct points from a user for redemption
	 * @param userId - The user ID to deduct points from
	 * @param itemId - The item being redeemed
	 * @param points - Points to deduct
	 * @returns Updated user points balance
	 */
	static async deductPoints(userId: string, itemId: string, points: number): Promise<number> {
		// Check if user has enough points
		const hasEnoughPoints = await this.checkUserPoints(userId, points);
		if (!hasEnoughPoints) {
			throw new ValidationError("Insufficient points for this redemption");
		}

		// Create point transaction (negative amount for redemption)
		await prisma.pointTransaction.create({
			data: {
				userId,
				itemId,
				amount: -points,
				type: TransactionType.REDEEMED,
			},
		});

		// Update user points balance
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				points: {
					decrement: points,
				},
			},
			select: { points: true },
		});

		return updatedUser.points;
	}

	/**
	 * Get user's point transaction history
	 * @param userId - The user ID
	 * @param type - Filter by transaction type
	 * @param page - Page number
	 * @param limit - Items per page
	 * @returns Point transactions with pagination
	 */
	static async getUserPointTransactions(
		userId: string,
		type?: "earned" | "redeemed" | "all",
		page: number = 1,
		limit: number = 20,
	) {
		const where = {
			userId,
			...(type &&
				type !== "all" && {
					type: type === "earned" ? TransactionType.EARNED : TransactionType.REDEEMED,
				}),
		};

		const [transactions, total] = await Promise.all([
			prisma.pointTransaction.findMany({
				where,
				include: {
					item: {
						select: {
							id: true,
							title: true,
							images: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.pointTransaction.count({ where }),
		]);

		// Calculate totals
		const totals = await prisma.pointTransaction.groupBy({
			by: ["type"],
			where: { userId },
			_sum: {
				amount: true,
			},
		});

		const earnedTotal = totals.find((t) => t.type === TransactionType.EARNED)?._sum.amount || 0;
		const redeemedTotal = Math.abs(totals.find((t) => t.type === TransactionType.REDEEMED)?._sum.amount || 0);

		return {
			transactions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
			summary: {
				totalEarned: earnedTotal,
				totalRedeemed: redeemedTotal,
				currentBalance: earnedTotal - redeemedTotal,
			},
		};
	}

	/**
	 * Get points leaderboard
	 * @param limit - Number of users to return
	 * @returns Top users by points
	 */
	static async getPointsLeaderboard(limit: number = 10) {
		const users = await prisma.user.findMany({
			where: {
				points: {
					gt: 0,
				},
			},
			select: {
				id: true,
				name: true,
				points: true,
				_count: {
					select: {
						items: {
							where: {
								status: "SWAPPED",
							},
						},
					},
				},
			},
			orderBy: {
				points: "desc",
			},
			take: limit,
		});

		return users.map((user, index) => ({
			rank: index + 1,
			userId: user.id,
			name: user.name,
			points: user.points,
			itemsSwapped: user._count.items,
		}));
	}
}
