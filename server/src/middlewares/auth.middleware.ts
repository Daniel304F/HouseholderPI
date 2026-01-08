import type { Request, Response, NextFunction } from "express";
import { jwtService } from "../services/jwt.service.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Kein Authentifizierungs-Token vorhanden.",
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: "Ungültiger oder abgelaufener Token.",
      });
      return;
    }

    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).userEmail = payload.email;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Authentifizierung fehlgeschlagen.",
    });
  }
};
