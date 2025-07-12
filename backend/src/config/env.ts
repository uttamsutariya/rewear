import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`);
	}
}

export const config = {
	// Server
	port: parseInt(process.env.PORT || "5000", 10),
	nodeEnv: process.env.NODE_ENV || "development",
	isDevelopment: process.env.NODE_ENV === "development",
	isProduction: process.env.NODE_ENV === "production",

	// Database
	databaseUrl: process.env.DATABASE_URL!,

	// JWT
	jwt: {
		secret: process.env.JWT_SECRET!,
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	},

	// CORS
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

	// File Upload
	upload: {
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
		allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/webp",
		],
	},
};
