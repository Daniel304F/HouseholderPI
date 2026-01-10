import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { jwtService } from "../services/jwt.service.js";
import config from "../config/config.js";
import { CookieOptions } from "express";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getUserDAO = (req: Request) =>
  req.app.locals["userDAO"] as GenericDAO<User>;

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    const { email, password, name } = req.body;

    const existingUser = await userDAO.findOne({ email } as any);
    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
    );

    const newUser = await userDAO.create({
      email,
      name,
      password: hashedPassword,
      avatar: req.body.avatar,
    } as any);

    const { accessToken, refreshToken } = jwtService.generateTokens(
      newUser.id,
      newUser.email
    );

    const { password: _, ...userWithoutPassword } = newUser;
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDAO = getUserDAO(req);
    const { email, password } = req.body;

    const user = await userDAO.findOne({ email } as any);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isValid = await bcrypt.compare(password, (user as any).password);
    if (!isValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const { accessToken, refreshToken } = jwtService.generateTokens(
      user.id,
      user.email
    );
    const { password: _, ...userWithoutPassword } = user;

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token required" });
      return;
    }

    const decoded = jwtService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.clearCookie("refreshToken", cookieOptions);
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const userDAO = getUserDAO(req);
    const user = await userDAO.findOne({ id: decoded.userId } as any);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const accessToken = jwtService.generateAccessToken(user.id, user.email);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const userDAO = getUserDAO(req);

    const user = await userDAO.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ success: false, message: "User nicht gefunden" });
      return;
    }

    const { password, ...userWithoutPassword } = user as any;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
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
