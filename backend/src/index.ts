import express from "express";
import cors from "cors";
import "express-async-errors";
import { config } from "./config/env";
import { prisma } from "./config/database";
import { AppError } from "./utils/errors";
import { sendError } from "./utils/responses";

// Create Express app
const app = express();

// Middleware
app.use(
	cors({
		origin: config.frontendUrl,
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (config.isDevelopment) {
	app.use((req, res, next) => {
		console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
		next();
	});
}

// Health check route
app.get("/api/health", async (req, res) => {
	try {
		// Test database connection
		await prisma.$queryRaw`SELECT 1`;

		res.json({
			status: "ok",
			message: "ReWear API is running",
			timestamp: new Date().toISOString(),
			environment: config.nodeEnv,
		});
	} catch (error) {
		res.status(503).json({
			status: "error",
			message: "Database connection failed",
			timestamp: new Date().toISOString(),
		});
	}
});

// API Routes (to be added in subsequent phases)
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/swaps", swapRoutes);
// app.use("/api/points", pointRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.path} not found`,
	});
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error("Error:", err);

	// Handle custom AppError
	if (err instanceof AppError) {
		return sendError(res, err.name, err.message, err.statusCode);
	}

	// Handle Prisma errors
	if (err.code === "P2002") {
		return sendError(res, "Conflict", "A record with this data already exists", 409);
	}

	if (err.code === "P2025") {
		return sendError(res, "Not Found", "The requested record was not found", 404);
	}

	// Handle validation errors (will be added with Zod)
	if (err.name === "ZodError") {
		return sendError(res, "Validation Error", "Invalid request data", 400, err.errors);
	}

	// Default error response
	const statusCode = err.statusCode || 500;
	const message = err.message || "An unexpected error occurred";

	sendError(res, "Internal Server Error", message, statusCode, config.isDevelopment ? { stack: err.stack } : undefined);
});

// Start server
const server = app.listen(config.port, () => {
	console.log(`🚀 ReWear API is running on port ${config.port}`);
	console.log(`📍 Environment: ${config.nodeEnv}`);
	console.log(`🗄️  Database: Connected`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("SIGTERM received. Shutting down gracefully...");
	server.close(() => {
		console.log("Server closed");
	});
	await prisma.$disconnect();
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("SIGINT received. Shutting down gracefully...");
	server.close(() => {
		console.log("Server closed");
	});
	await prisma.$disconnect();
	process.exit(0);
});

export default app;
