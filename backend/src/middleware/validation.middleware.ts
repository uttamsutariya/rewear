import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

/**
 * Middleware factory for validating request data with Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Where to get the data from (body, query, params)
 * @returns Express middleware function
 */
export const validate = (schema: AnyZodObject, source: "body" | "query" | "params" = "body") => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validated = await schema.parseAsync(req[source]);

			// Replace the request data with validated/transformed data
			req[source] = validated;

			next();
			return;
		} catch (err) {
			next(err);
			return;
		}
	};
};
