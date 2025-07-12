import express from "express";
import cors from "cors";
import "express-async-errors";
import { config } from "./config/env";
import { prisma } from "./config/database";
import { AppError } from "./utils/errors";
import { sendError } from "./utils/responses";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import uploadRoutes from "./routes/upload.routes";
import itemRoutes from "./routes/items.routes";
import swapRoutes from "./routes/swaps.routes";
import pointRoutes from "./routes/points.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

// Create HTTP server
const server = require("http").createServer(app);

// Middleware
app.use(
	cors({
		origin: config.frontendUrl,
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.isDevelopment) {
	app.use((req, res, next) => {
		console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
		next();
	});
}

app.get("/api/health", async (req, res) => {
	try {
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.path} not found`,
	});
});

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

	if (err.name === "ZodError") {
		return sendError(res, "Validation Error", "Invalid request data", 400, err.errors);
	}

	const statusCode = err.statusCode || 500;
	const message = err.message || "An unexpected error occurred";

	sendError(res, "Internal Server Error", message, statusCode, config.isDevelopment ? { stack: err.stack } : undefined);
});

async function ensureDatabaseConnection() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		console.log("✅ Database connection established");
	} catch (error) {
		console.error("❌ Failed to connect to database:", error);
		process.exit(1);
	}
}

// Start server
const startServer = async () => {
	try {
		await ensureDatabaseConnection();

		server.listen(config.port, () => {
			console.log(`🚀 ReWear API is running on port ${config.port}`);
			console.log(`📍 Environment: ${config.nodeEnv}`);
			console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
		});

		server.on("error", (error: NodeJS.ErrnoException) => {
			if (error.code === "EADDRINUSE") {
				console.error(`Port ${config.port} is already in use`);
			} else {
				console.error("Server error:", error);
			}
			process.exit(1);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

const shutdown = async () => {
	console.log("\nShutting down gracefully...");

	try {
		await new Promise<void>((resolve, reject) => {
			server.close((err: Error) => {
				if (err) {
					console.error("Error closing server:", err);
					reject(err);
				} else {
					console.log("Server closed");
					resolve();
				}
			});
		});

		await prisma.$disconnect();
		console.log("Database connection closed");
		process.exit(0);
	} catch (error) {
		console.error("Error during shutdown:", error);
		process.exit(1);
	}
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);
	shutdown();
});

export default app;
