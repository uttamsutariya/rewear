import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireAuth } from "../middleware/auth.middleware";
import { uploadImages } from "../middleware/upload.middleware";
import { UploadService } from "../services/upload.service";
import { sendSuccess } from "../utils/responses";
import { ValidationError } from "../utils/errors";

const router = Router();

/**
 * POST /api/upload/images
 * Upload multiple images to Cloudinary
 * Requires authentication
 */
router.post(
	"/images",
	authenticate,
	requireAuth,
	(req: Request, res: Response, next: NextFunction) => {
		uploadImages(req, res, (err) => {
			if (err) return next(err);
			next();
		});
	},
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
				throw new ValidationError("No images uploaded");
			}

			const uploadResults = await UploadService.uploadImages(req.files as Express.Multer.File[]);

			// Return only the URLs for simplicity
			const urls = uploadResults.map((result) => result.url);

			sendSuccess(
				res,
				{
					urls,
					count: urls.length,
					message: `Successfully uploaded ${urls.length} image(s)`,
				},
				"Images uploaded successfully",
				201,
			);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * POST /api/upload/image
 * Upload a single image to Cloudinary
 * Requires authentication
 */
router.post(
	"/image",
	authenticate,
	requireAuth,
	(req: Request, res: Response, next: NextFunction) => {
		const singleUpload = uploadImages;
		singleUpload(req, res, (err) => {
			if (err) return next(err);
			next();
		});
	},
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
				throw new ValidationError("No image uploaded");
			}

			// Take only the first file for single upload
			const file = (req.files as Express.Multer.File[])[0];

			const uploadResult = await UploadService.uploadImage(file);

			sendSuccess(
				res,
				{
					url: uploadResult.url,
					metadata: {
						width: uploadResult.width,
						height: uploadResult.height,
						format: uploadResult.format,
						size: uploadResult.size,
					},
				},
				"Image uploaded successfully",
				201,
			);
		} catch (error) {
			next(error);
		}
	},
);

export default router;
