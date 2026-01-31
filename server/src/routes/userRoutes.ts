import { Router, RequestHandler } from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
} from "../schemas/user.schema.js";

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

// Change password
router.post(
  "/change-password",
  validateResource(changePasswordSchema) as RequestHandler,
  userController.changePassword as RequestHandler
);

// Change email
router.post(
  "/change-email",
  validateResource(changeEmailSchema) as RequestHandler,
  userController.changeEmail as RequestHandler
);

// Delete account
router.delete(
  "/account",
  validateResource(deleteAccountSchema) as RequestHandler,
  userController.deleteAccount as RequestHandler
);

export default router;
