import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "express-async-errors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		message: "ReWear API is running",
		timestamp: new Date().toISOString(),
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server is running on port ${PORT}`);
	console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
