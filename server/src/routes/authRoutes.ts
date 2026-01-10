import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post(
  "/register",
  validateResource(registerSchema),
  authController.register
);
router.post("/login", validateResource(loginSchema), authController.login);
router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

router.get("/me", authMiddleware, authController.getMe);

export default router;
