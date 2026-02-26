import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  subscribeSchema,
  unsubscribeSchema,
} from "../schemas/notification.schema.js";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/subscribe",
  validateResource(subscribeSchema),
  notificationController.subscribe as RequestHandler,
);

router.post(
  "/unsubscribe",
  validateResource(unsubscribeSchema),
  notificationController.unsubscribe as RequestHandler,
);

export default router;
