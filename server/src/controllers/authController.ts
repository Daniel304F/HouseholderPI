import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { AuthService } from "../services/auth.service.js";
import { AppError } from "../services/errors.js";
import { CookieOptions } from "express";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getAuthService = (req: Request): AuthService => {
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new AuthService(userDAO);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authService = getAuthService(req);
    const { email, password, name, avatar } = req.body;

    const result = await authService.register(email, password, name, avatar);

    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authService = getAuthService(req);
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.cookie("refreshToken", result.refreshToken, cookieOptions);
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const authService = getAuthService(req);
    const refreshToken = req.cookies["refreshToken"];

    const result = await authService.refresh(refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.clearCookie("refreshToken", cookieOptions);
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authService = getAuthService(req);
    const userId = (req as AuthenticatedRequest).userId;

    const user = await authService.getMe(userId);

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

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Erfolgreich ausgeloggt",
    });
  } catch (error) {
    next(error);
  }
};
