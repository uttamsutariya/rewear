import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { UnauthorizedError } from "../utils/errors";
import { WorkOSService } from "../services/workos.service";

/**
 * Authentication middleware that verifies WorkOS JWT tokens
 * and ensures the user exists in our database
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedError("No token provided");
		}

		const token = authHeader.substring(7); // Remove "Bearer " prefix

		// Verify token with WorkOS
		const workosUser = await WorkOSService.verifyToken(token);

		let user = await prisma.user.findUnique({
			where: { email: workosUser.email },
		});

		if (!user) {
			try {
				user = await prisma.user.create({
					data: {
						email: workosUser.email,
						name:
							workosUser.firstName && workosUser.lastName
								? `${workosUser.firstName} ${workosUser.lastName}`
								: workosUser.email.split("@")[0], // Fallback to email prefix
						points: 0,
						isAdmin: false,
					},
				});
			} catch (error: any) {
				// Handle race condition - if another request already created the user
				if (error.code === "P2002") {
					// Unique constraint violation - user was created by another request
					user = await prisma.user.findUnique({
						where: { email: workosUser.email },
					});

					if (!user) {
						throw new UnauthorizedError("Failed to create or find user");
					}
				} else {
					throw error;
				}
			}
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

/**
 * Optional middleware to require authentication
 * Use this for routes that must have an authenticated user
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		throw new UnauthorizedError("Authentication required");
	}
	next();
};
