import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

router.post("/logout", (_req, res) => {
  res.status(200).json({ success: true, message: "Logged out" });
});

router.get("/me", authMiddleware, authController.getMe);

export default router;
