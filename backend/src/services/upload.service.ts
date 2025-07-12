import cloudinary from "../config/cloudinary";
import { config } from "../config/env";
import { ValidationError } from "../utils/errors";
import crypto from "crypto";

export interface UploadResult {
	url: string;
	publicId: string;
	width: number;
	height: number;
	format: string;
	size: number;
}

export class UploadService {
	/**
	 * Upload a single image to Cloudinary
	 * @param file - The file buffer and metadata
	 * @returns Upload result with URL and metadata
	 */
	static async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
		try {
			// Generate unique filename
			const uniqueSuffix = crypto.randomBytes(6).toString("hex");
			const timestamp = Date.now();
			const publicId = `${config.cloudinary.uploadFolder}/${timestamp}-${uniqueSuffix}`;

			// Upload to Cloudinary
			const result = await new Promise<any>((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						public_id: publicId,
						folder: config.cloudinary.uploadFolder,
						resource_type: "image",
						allowed_formats: ["jpg", "jpeg", "png", "webp"],
						transformation: [
							{
								quality: "auto:good",
								fetch_format: "auto",
							},
						],
						// Add image optimizations
						flags: "attachment:false",
						use_filename: false,
						unique_filename: true,
					},
					(error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve(result);
						}
					},
				);

				// Send buffer to Cloudinary
				uploadStream.end(file.buffer);
			});

			return {
				url: result.secure_url,
				publicId: result.public_id,
				width: result.width,
				height: result.height,
				format: result.format,
				size: result.bytes,
			};
		} catch (error: any) {
			console.error("Cloudinary upload error:", error);
			throw new ValidationError(error.message || "Failed to upload image to Cloudinary");
		}
	}

	/**
	 * Upload multiple images to Cloudinary
	 * @param files - Array of files to upload
	 * @returns Array of upload results
	 */
	static async uploadImages(files: Express.Multer.File[]): Promise<UploadResult[]> {
		if (!files || files.length === 0) {
			throw new ValidationError("No images provided");
		}

		try {
			// Upload all images in parallel
			const uploadPromises = files.map((file) => this.uploadImage(file));
			const results = await Promise.all(uploadPromises);
			return results;
		} catch (error) {
			// If any upload fails, we should consider cleaning up successful uploads
			// For now, we'll just throw the error
			throw error;
		}
	}

	/**
	 * Delete an image from Cloudinary
	 * @param publicId - The public ID of the image to delete
	 */
	static async deleteImage(publicId: string): Promise<void> {
		try {
			await cloudinary.uploader.destroy(publicId);
		} catch (error) {
			console.error("Failed to delete image from Cloudinary:", error);
		}
	}

	/**
	 * Delete multiple images from Cloudinary
	 * @param publicIds - Array of public IDs to delete
	 */
	static async deleteImages(publicIds: string[]): Promise<void> {
		if (!publicIds || publicIds.length === 0) return;

		try {
			const deletePromises = publicIds.map((id) => this.deleteImage(id));
			await Promise.all(deletePromises);
		} catch (error) {
			console.error("Failed to delete images from Cloudinary:", error);
		}
	}
}
