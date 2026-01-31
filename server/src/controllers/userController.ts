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

    console.log("updateProfile called with userId:", userId);

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

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userService = getUserService(req);
    const userId = (req as AuthenticatedRequest).userId;
    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(userId, { currentPassword, newPassword });

    res.status(200).json({
      success: true,
      message: "Passwort erfolgreich geändert",
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

export const changeEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userService = getUserService(req);
    const userId = (req as AuthenticatedRequest).userId;
    const { newEmail, password } = req.body;

    const user = await userService.changeEmail(userId, { newEmail, password });

    res.status(200).json({
      success: true,
      data: user,
      message: "E-Mail erfolgreich geändert",
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

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userService = getUserService(req);
    const userId = (req as AuthenticatedRequest).userId;
    const { password } = req.body;

    await userService.deleteAccount(userId, password);

    // Clear cookies
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Konto erfolgreich gelöscht",
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
