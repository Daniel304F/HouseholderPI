import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import { subscribeSchema } from "../schemas/notification.schema.js";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/subscribe",
  validateResource(subscribeSchema),
  notificationController.subscribe as RequestHandler,
);

export default router;
