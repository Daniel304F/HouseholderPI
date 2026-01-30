import { Router, RequestHandler } from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import { updateProfileSchema } from "../schemas/user.schema.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Update user profile
router.patch(
  "/profile",
  validateResource(updateProfileSchema) as RequestHandler,
  userController.updateProfile as RequestHandler
);

// Remove avatar
router.delete("/avatar", userController.removeAvatar as RequestHandler);

export default router;
