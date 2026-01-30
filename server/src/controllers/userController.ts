import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { UserService } from "../services/user.service.js";
import { AppError } from "../services/errors.js";

const getUserService = (req: Request): UserService => {
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new UserService(userDAO);
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userService = getUserService(req);
    const userId = (req as AuthenticatedRequest).userId;
    const { name, avatar } = req.body;

    const user = await userService.updateProfile(userId, { name, avatar });

    res.status(200).json({
      success: true,
      data: user,
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

export const removeAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userService = getUserService(req);
    const userId = (req as AuthenticatedRequest).userId;

    const user = await userService.removeAvatar(userId);

    res.status(200).json({
      success: true,
      data: user,
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
