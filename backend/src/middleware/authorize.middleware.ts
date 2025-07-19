import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

/**
 * Middleware to require admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
	if (!req.user) {
		throw new UnauthorizedError("Authentication required");
	}

	if (!req.user.isAdmin) {
		throw new ForbiddenError("Admin access required");
	}

	next();
};

/**
 * Factory function to create middleware that checks resource ownership
 * @param getResourceOwnerId - Function that extracts the owner ID from the request
 * @returns Middleware function
 */
export const requireOwnership = (getResourceOwnerId: (req: Request) => Promise<string | null>) => {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		try {
			if (!req.user) {
				throw new UnauthorizedError("Authentication required");
			}

			if (req.user.isAdmin) {
				return next();
			}

			const ownerId = await getResourceOwnerId(req);

			if (!ownerId) {
				throw new ForbiddenError("Resource not found");
			}

			if (ownerId !== req.user.id) {
				throw new ForbiddenError("Access denied");
			}

			next();
			return;
		} catch (err) {
			next(err);
			return;
		}
	};
};

/**
 * Combined middleware that allows either admin or owner access
 * @param getResourceOwnerId - Function that extracts the owner ID from the request
 * @returns Middleware function
 */
export const requireAdminOrOwner = (getResourceOwnerId: (req: Request) => Promise<string | null>) => {
	return requireOwnership(getResourceOwnerId);
};
