import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { sendSuccess } from "../utils/responses";

const router = Router();

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", authenticate, (req, res) => {
	sendSuccess(res, {
		user: req.user!,
	});
});

/**
 * POST /api/auth/logout
 * Logout endpoint (mainly for frontend to clear session)
 * Since we use JWT tokens, there's no server-side session to clear
 */
router.post("/logout", (_req, res) => {
	sendSuccess(res, {
		message: "Logged out successfully",
	});
});

export default router;
