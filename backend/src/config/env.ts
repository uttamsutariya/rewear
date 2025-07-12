import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "WORKOS_API_KEY", "WORKOS_CLIENT_ID", "CLOUDINARY_CLOUD_NAME"];

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`);
	}
}

export const config = {
	// Server
	port: parseInt(process.env.PORT || "8080", 10),
	nodeEnv: process.env.NODE_ENV || "development",
	isDevelopment: process.env.NODE_ENV === "development",
	isProduction: process.env.NODE_ENV === "production",

	// Database
	databaseUrl: process.env.DATABASE_URL!,

	// WorkOS Authentication
	workos: {
		apiKey: process.env.WORKOS_API_KEY!,
		clientId: process.env.WORKOS_CLIENT_ID!,
		redirectUri: process.env.WORKOS_REDIRECT_URI || "http://localhost:5173/callback",
	},

	// CORS
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

	// Cloudinary (URLs stored only, upload handled client-side)
	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
	},
};
