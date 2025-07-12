import { prisma } from "../config/database";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";
import { CreateItemInput, UpdateItemInput, ListItemsQuery, UpdateItemStatusInput } from "../schemas/item.schema";
import { Prisma, Item, ItemStatus } from "@prisma/client";

export class ItemService {
	/**
	 * Create a new item
	 * @param userId - The ID of the user creating the item
	 * @param data - Item data
	 * @returns The created item
	 */
	static async createItem(userId: string, data: CreateItemInput): Promise<Item> {
		// Create item with PENDING status (requires admin approval)
		const item = await prisma.item.create({
			data: {
				...data,
				userId,
				status: ItemStatus.PENDING,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return item;
	}

	/**
	 * Get a single item by ID
	 * @param itemId - The item ID
	 * @param includeUser - Whether to include user data
	 * @returns The item
	 */
	static async getItemById(itemId: string, includeUser: boolean = true): Promise<Item> {
		const item = await prisma.item.findUnique({
			where: { id: itemId },
			include: includeUser
				? {
						user: {
							select: {
								id: true,
								name: true,
								createdAt: true,
							},
						},
					}
				: undefined,
		});

		if (!item) {
			throw new NotFoundError("Item not found");
		}

		return item;
	}

	/**
	 * List items with filtering, pagination, and sorting
	 * @param query - Query parameters
	 * @param publicOnly - Whether to show only approved & available items
	 * @returns Paginated items list
	 */
	static async listItems(query: ListItemsQuery, publicOnly: boolean = true) {
		const { category, type, size, condition, tags, search, status, userId, page, limit, sortBy, sortOrder } = query;

		// Build where clause
		const where: Prisma.ItemWhereInput = {
			...(publicOnly && {
				status: ItemStatus.AVAILABLE,
			}),
			...(status && !publicOnly && { status }),
			...(category && { category }),
			...(type && { type }),
			...(size && { size }),
			...(condition && { condition }),
			...(userId && { userId }),
			...(tags && {
				tags: {
					hasSome: Array.isArray(tags) ? tags : [tags],
				},
			}),
			...(search && {
				OR: [
					{ title: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
					{ tags: { has: search } },
				],
			}),
		};

		// Execute query with pagination
		const [items, total] = await Promise.all([
			prisma.item.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: {
					[sortBy]: sortOrder,
				},
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.item.count({ where }),
		]);

		return {
			items,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get featured items for the homepage
	 * @param limit - Number of items to return
	 * @returns Featured items
	 */
	static async getFeaturedItems(limit: number = 10): Promise<Item[]> {
		// Get recently approved available items
		const items = await prisma.item.findMany({
			where: {
				status: ItemStatus.AVAILABLE,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
		});

		return items;
	}

	/**
	 * Update an item
	 * @param itemId - The item ID
	 * @param userId - The user ID (for ownership check)
	 * @param data - Update data
	 * @param isAdmin - Whether the user is an admin
	 * @returns Updated item
	 */
	static async updateItem(
		itemId: string,
		userId: string,
		data: UpdateItemInput,
		isAdmin: boolean = false,
	): Promise<Item> {
		// Get existing item
		const item = await this.getItemById(itemId, false);

		// Check ownership (unless admin)
		if (!isAdmin && item.userId !== userId) {
			throw new ForbiddenError("You can only update your own items");
		}

		// Prevent updating swapped items
		if (item.status === ItemStatus.SWAPPED) {
			throw new ValidationError("Cannot update swapped items");
		}

		// Update item
		const updatedItem = await prisma.item.update({
			where: { id: itemId },
			data: {
				...data,
				// Reset to pending if non-admin updates approved item
				...(item.status === ItemStatus.APPROVED &&
					!isAdmin && {
						status: ItemStatus.PENDING,
					}),
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return updatedItem;
	}

	/**
	 * Delete an item
	 * @param itemId - The item ID
	 * @param userId - The user ID (for ownership check)
	 * @param isAdmin - Whether the user is an admin
	 */
	static async deleteItem(itemId: string, userId: string, isAdmin: boolean = false): Promise<void> {
		// Get existing item
		const item = await this.getItemById(itemId, false);

		// Check ownership (unless admin)
		if (!isAdmin && item.userId !== userId) {
			throw new ForbiddenError("You can only delete your own items");
		}

		// Prevent deleting swapped items
		if (item.status === ItemStatus.SWAPPED) {
			throw new ValidationError("Cannot delete swapped items");
		}

		// Check if item has pending swap requests
		const pendingSwaps = await prisma.swapRequest.count({
			where: {
				OR: [
					{ itemId: itemId, status: "PENDING" },
					{ offeredItemId: itemId, status: "PENDING" },
				],
			},
		});

		if (pendingSwaps > 0) {
			throw new ValidationError("Cannot delete item with pending swap requests");
		}

		// Delete item
		await prisma.item.delete({
			where: { id: itemId },
		});
	}

	/**
	 * Update item status (admin only)
	 * @param itemId - The item ID
	 * @param data - Status update data
	 * @returns Updated item
	 */
	static async updateItemStatus(itemId: string, data: UpdateItemStatusInput): Promise<Item> {
		// Get existing item
		const item = await this.getItemById(itemId, false);

		// Validate status transition
		if (item.status !== ItemStatus.PENDING) {
			throw new ValidationError("Can only approve/reject pending items");
		}

		// Update status
		const updatedItem = await prisma.item.update({
			where: { id: itemId },
			data: {
				status: data.status === "APPROVED" ? ItemStatus.AVAILABLE : ItemStatus.REJECTED,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		// TODO: Send notification to user about approval/rejection

		return updatedItem;
	}

	/**
	 * Get items by user
	 * @param userId - The user ID
	 * @param requesterId - The ID of the user making the request
	 * @param isAdmin - Whether the requester is an admin
	 * @returns User's items
	 */
	static async getItemsByUser(userId: string, requesterId: string, isAdmin: boolean = false) {
		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		// Determine what items to show
		const where: Prisma.ItemWhereInput = {
			userId,
			// Show all items if owner or admin, otherwise only available
			...(userId !== requesterId &&
				!isAdmin && {
					status: ItemStatus.AVAILABLE,
				}),
		};

		const items = await prisma.item.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
		});

		return items;
	}
}
