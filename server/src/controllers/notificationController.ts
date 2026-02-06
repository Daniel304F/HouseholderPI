import { Response, NextFunction, Request } from "express";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { NotificationService } from "../services/notification.service.js";
import { AppError } from "../services/errors.js";

const getNotificationService = (req: Request): NotificationService => {
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new NotificationService(userDAO);
};

/**
 * Registriert eine Push-Subscription für den aktuellen User
 * POST /api/notifications/subscribe
 */
export const subscribe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notificationService = getNotificationService(req);
    const { endpoint, keys } = req.body;

    await notificationService.addSubscription(req.userId, { endpoint, keys });

    res.status(201).json({
      success: true,
      message: "Subscription gespeichert",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
