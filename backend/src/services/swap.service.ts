import { prisma } from "../config/database";
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from "../utils/errors";
import {
	CreateSwapRequestInput,
	CreatePointRedemptionInput,
	RespondToSwapRequestInput,
	ListSwapRequestsQuery,
} from "../schemas/swap.schema";
import { SwapRequest, SwapRequestStatus, ItemStatus, Prisma } from "@prisma/client";
import { PointsService } from "./points.service";
import { TransactionType } from "@prisma/client";

export class SwapService {
	/**
	 * Create a direct swap request (item for item)
	 * @param requesterId - The user making the request
	 * @param data - Swap request data
	 * @returns Created swap request
	 */
	static async createSwapRequest(requesterId: string, data: CreateSwapRequestInput): Promise<SwapRequest> {
		const { itemId, offeredItemId } = data;

		const requestedItem = await prisma.item.findUnique({
			where: { id: itemId },
			include: { user: true },
		});

		if (!requestedItem) {
			throw new NotFoundError("Requested item not found");
		}

		if (requestedItem.status !== ItemStatus.AVAILABLE) {
			throw new ValidationError("Item is not available for swapping");
		}

		if (requestedItem.userId === requesterId) {
			throw new ValidationError("Cannot request your own item");
		}

		if (offeredItemId) {
			const offeredItem = await prisma.item.findUnique({
				where: { id: offeredItemId },
			});

			if (!offeredItem) {
				throw new NotFoundError("Offered item not found");
			}

			if (offeredItem.userId !== requesterId) {
				throw new ForbiddenError("You can only offer your own items");
			}

			if (offeredItem.status !== ItemStatus.AVAILABLE) {
				throw new ValidationError("Offered item is not available for swapping");
			}
		}

		const existingRequest = await prisma.swapRequest.findFirst({
			where: {
				requesterId,
				itemId,
				status: SwapRequestStatus.PENDING,
			},
		});

		if (existingRequest) {
			throw new ConflictError("You already have a pending request for this item");
		}

		const swapRequest = await prisma.swapRequest.create({
			data: {
				requesterId,
				itemId,
				offeredItemId,
				status: SwapRequestStatus.PENDING,
			},
			include: {
				item: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				requester: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return swapRequest;
	}

	/**
	 * Create a point redemption request
	 * @param requesterId - The user making the request
	 * @param data - Redemption data
	 * @returns Created swap request
	 */
	static async createPointRedemption(requesterId: string, data: CreatePointRedemptionInput): Promise<SwapRequest> {
		const { itemId } = data;

		const item = await prisma.item.findUnique({
			where: { id: itemId },
			include: { user: true },
		});

		if (!item) {
			throw new NotFoundError("Item not found");
		}

		if (item.status !== ItemStatus.AVAILABLE) {
			throw new ValidationError("Item is not available for redemption");
		}

		if (item.userId === requesterId) {
			throw new ValidationError("Cannot redeem your own item");
		}

		const requiredPoints = PointsService.calculateItemPoints(item.condition);

		const hasEnoughPoints = await PointsService.checkUserPoints(requesterId, requiredPoints);
		if (!hasEnoughPoints) {
			throw new ValidationError(`Insufficient points. This item requires ${requiredPoints} points.`);
		}

		const existingRequest = await prisma.swapRequest.findFirst({
			where: {
				requesterId,
				itemId,
				status: SwapRequestStatus.PENDING,
			},
		});

		if (existingRequest) {
			throw new ConflictError("You already have a pending request for this item");
		}

		const swapRequest = await prisma.swapRequest.create({
			data: {
				requesterId,
				itemId,
				offeredItemId: null,
				status: SwapRequestStatus.PENDING,
			},
			include: {
				item: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				requester: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return swapRequest;
	}

	/**
	 * Respond to a swap request (accept or reject)
	 * @param swapRequestId - The swap request ID
	 * @param ownerId - The item owner responding
	 * @param response - Accept or reject
	 * @returns Updated swap request
	 */
	static async respondToSwapRequest(
		swapRequestId: string,
		ownerId: string,
		response: RespondToSwapRequestInput,
	): Promise<any> {
		const swapRequest = await prisma.swapRequest.findUnique({
			where: { id: swapRequestId },
			include: {
				item: true,
				requester: true,
			},
		});

		if (!swapRequest) {
			throw new NotFoundError("Swap request not found");
		}

		if (swapRequest.item.userId !== ownerId) {
			throw new ForbiddenError("You can only respond to requests for your own items");
		}

		if (swapRequest.status !== SwapRequestStatus.PENDING) {
			throw new ValidationError("This request has already been processed");
		}

		if (response.action === "reject") {
			const updatedRequest = await prisma.swapRequest.update({
				where: { id: swapRequestId },
				data: {
					status: SwapRequestStatus.REJECTED,
				},
			});

			return updatedRequest;
		}

		if (response.action === "accept") {
			const result = await prisma.$transaction(async (tx) => {
				const updatedRequest = await tx.swapRequest.update({
					where: { id: swapRequestId },
					data: {
						status: SwapRequestStatus.ACCEPTED,
					},
				});

				const isPointRedemption = !swapRequest.offeredItemId;
				let itemGivenId: string;
				let itemReceivedId: string;

				if (isPointRedemption) {
					itemGivenId = swapRequest.itemId; // Owner gives their item
					itemReceivedId = swapRequest.itemId; // Requester receives it

					// Calculate points
					const points = PointsService.calculateItemPoints(swapRequest.item.condition);

					const requester = await tx.user.findUnique({
						where: { id: swapRequest.requesterId },
						select: { points: true },
					});

					if (!requester || requester.points < points) {
						throw new ValidationError("Requester no longer has enough points for this redemption");
					}

					await tx.pointTransaction.create({
						data: {
							userId: swapRequest.requesterId,
							itemId: swapRequest.itemId,
							amount: -points,
							type: TransactionType.REDEEMED,
						},
					});

					await tx.user.update({
						where: { id: swapRequest.requesterId },
						data: {
							points: {
								decrement: points,
							},
						},
					});

					await tx.pointTransaction.create({
						data: {
							userId: swapRequest.item.userId,
							itemId: swapRequest.itemId,
							amount: points,
							type: TransactionType.EARNED,
						},
					});

					await tx.user.update({
						where: { id: swapRequest.item.userId },
						data: {
							points: {
								increment: points,
							},
						},
					});

					await tx.item.update({
						where: { id: swapRequest.itemId },
						data: { status: ItemStatus.SWAPPED },
					});
				} else {
					itemGivenId = swapRequest.offeredItemId!;
					itemReceivedId = swapRequest.itemId;

					await tx.item.updateMany({
						where: {
							id: {
								in: [swapRequest.itemId, swapRequest.offeredItemId!],
							},
						},
						data: { status: ItemStatus.SWAPPED },
					});
				}

				const swap = await tx.swap.create({
					data: {
						swapRequestId: swapRequest.id,
						initiatorId: swapRequest.requesterId,
						receiverId: swapRequest.item.userId,
						itemGivenId: isPointRedemption ? swapRequest.itemId : itemGivenId,
						itemReceivedId: isPointRedemption ? swapRequest.itemId : itemReceivedId,
					},
					include: {
						itemGiven: true,
						itemReceived: true,
						initiator: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						receiver: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				});

				await tx.swapRequest.updateMany({
					where: {
						AND: [
							{
								OR: [
									{ itemId: swapRequest.itemId },
									{ offeredItemId: swapRequest.itemId },
									...(swapRequest.offeredItemId
										? [{ itemId: swapRequest.offeredItemId }, { offeredItemId: swapRequest.offeredItemId }]
										: []),
								],
							},
							{
								id: { not: swapRequestId },
								status: SwapRequestStatus.PENDING,
							},
						],
					},
					data: {
						status: SwapRequestStatus.CANCELLED,
					},
				});

				return {
					swapRequest: updatedRequest,
					swap,
					isPointRedemption,
				};
			});

			return result;
		}
	}

	/**
	 * Cancel a swap request
	 * @param swapRequestId - The swap request ID
	 * @param userId - The user cancelling (must be requester)
	 * @returns Updated swap request
	 */
	static async cancelSwapRequest(swapRequestId: string, userId: string): Promise<SwapRequest> {
		const swapRequest = await prisma.swapRequest.findUnique({
			where: { id: swapRequestId },
		});

		if (!swapRequest) {
			throw new NotFoundError("Swap request not found");
		}

		if (swapRequest.requesterId !== userId) {
			throw new ForbiddenError("You can only cancel your own requests");
		}

		if (swapRequest.status !== SwapRequestStatus.PENDING) {
			throw new ValidationError("Only pending requests can be cancelled");
		}

		const updatedRequest = await prisma.swapRequest.update({
			where: { id: swapRequestId },
			data: {
				status: SwapRequestStatus.CANCELLED,
			},
		});

		return updatedRequest;
	}

	/**
	 * List swap requests for a user
	 * @param userId - The user ID
	 * @param query - Query filters
	 * @returns Paginated swap requests
	 */
	static async listSwapRequests(userId: string, query: ListSwapRequestsQuery) {
		const { type, status, page, limit } = query;

		let where: Prisma.SwapRequestWhereInput = {};

		if (type === "sent") {
			where.requesterId = userId;
		} else if (type === "received") {
			where.item = {
				userId,
			};
		} else {
			where.OR = [{ requesterId: userId }, { item: { userId } }];
		}

		if (status) {
			where.status = status;
		}

		const [requests, total] = await Promise.all([
			prisma.swapRequest.findMany({
				where,
				include: {
					item: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					requester: {
						select: {
							id: true,
							name: true,
						},
					},
					swap: true,
				},
				orderBy: {
					createdAt: "desc",
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.swapRequest.count({ where }),
		]);

		const enrichedRequests = requests.map((request) => ({
			...request,
			isPointRedemption: !request.offeredItemId,
			isSent: request.requesterId === userId,
			isReceived: request.item.userId === userId,
		}));

		return {
			requests: enrichedRequests,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get user's swap history
	 * @param userId - The user ID
	 * @param page - Page number
	 * @param limit - Items per page
	 * @returns Paginated swap history
	 */
	static async getSwapHistory(userId: string, page: number = 1, limit: number = 20) {
		const where = {
			OR: [{ initiatorId: userId }, { receiverId: userId }],
		};

		const [swaps, total] = await Promise.all([
			prisma.swap.findMany({
				where,
				include: {
					itemGiven: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					itemReceived: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					initiator: {
						select: {
							id: true,
							name: true,
						},
					},
					receiver: {
						select: {
							id: true,
							name: true,
						},
					},
					swapRequest: true,
				},
				orderBy: {
					completedAt: "desc",
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.swap.count({ where }),
		]);

		// Add metadata
		const enrichedSwaps = swaps.map((swap) => ({
			...swap,
			isPointRedemption: swap.itemGivenId === swap.itemReceivedId,
			userRole: swap.initiatorId === userId ? "initiator" : "receiver",
		}));

		return {
			swaps: enrichedSwaps,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get swap request details
	 * @param swapRequestId - The swap request ID
	 * @param userId - The user requesting details
	 * @returns Swap request details
	 */
	static async getSwapRequestDetails(swapRequestId: string, userId: string) {
		const swapRequest = await prisma.swapRequest.findUnique({
			where: { id: swapRequestId },
			include: {
				item: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				requester: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				swap: {
					include: {
						itemGiven: true,
						itemReceived: true,
					},
				},
			},
		});

		if (!swapRequest) {
			throw new NotFoundError("Swap request not found");
		}

		const isRequester = swapRequest.requesterId === userId;
		const isOwner = swapRequest.item.userId === userId;

		if (!isRequester && !isOwner) {
			throw new ForbiddenError("You are not involved in this swap request");
		}

		const pointsRequired = !swapRequest.offeredItemId
			? PointsService.calculateItemPoints(swapRequest.item.condition)
			: null;

		return {
			...swapRequest,
			isPointRedemption: !swapRequest.offeredItemId,
			pointsRequired,
			userRole: isRequester ? "requester" : "owner",
		};
	}
}
