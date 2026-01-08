import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { TokenPayload } from "../types/auth/tokenPayload.js";
import { AuthTokens } from "../types/auth/authTokens.js";

export class JwtService {
  generateAccessToken(userId: string, email: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      type: "access",
    };

    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    });
  }

  generateRefreshToken(userId: string, email: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      type: "refresh",
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  generateTokens(userId: string, email: string): AuthTokens {
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        config.jwt.accessSecret
      ) as TokenPayload;
      if (decoded.type !== "access") {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        config.jwt.refreshSecret
      ) as TokenPayload;
      if (decoded.type !== "refresh") {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }
}

export const jwtService = new JwtService();
