import multer from "multer";
import { Request } from "express";
import { config } from "../config/env";
import { ValidationError } from "../utils/errors";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	// Check file mimetype
	if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new ValidationError(`Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(", ")}`));
	}
};

// Create multer upload instance
export const uploadImages = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: config.upload.maxFileSize,
		files: config.upload.maxFiles,
	},
}).array("images", config.upload.maxFiles);

// Error handler for multer
export const handleUploadError = (error: any): string => {
	if (error instanceof multer.MulterError) {
		switch (error.code) {
			case "LIMIT_FILE_SIZE":
				return `File too large. Maximum size is ${config.upload.maxFileSize / 1024 / 1024}MB`;
			case "LIMIT_FILE_COUNT":
				return `Too many files. Maximum is ${config.upload.maxFiles} files`;
			case "LIMIT_UNEXPECTED_FILE":
				return "Unexpected file field";
			default:
				return "File upload error";
		}
	}
	return error.message || "File upload failed";
};
