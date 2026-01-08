import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import config from "../config/config.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const getUserDAO = (req: Request) =>
  req.app.locals["userDAO"] as GenericDAO<User>;

const generateTokens = (user: User) => {
  const accessToken = jwt.sign({ id: user.id }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

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

    const tokens = generateTokens(newUser);

    const { password: _, ...userWithoutPassword } = newUser as any;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens,
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

    const tokens = generateTokens(user);
    const { password: _, ...userWithoutPassword } = user as any;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens,
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
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token required" });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
      id: string;
    };

    const userDAO = getUserDAO(req);
    const user = await userDAO.findOne({ id: decoded.id } as any);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
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

    const userDAO = req.app.locals["userDAO"];

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
