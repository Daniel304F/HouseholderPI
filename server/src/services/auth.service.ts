import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { jwtService } from "./jwt.service.js";
import config from "../config/config.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "./errors.js";

export interface AuthResult {
  user: Omit<User, "password">;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
}

export class AuthService {
  constructor(private userDAO: GenericDAO<User>) {}

  async register(
    email: string,
    password: string,
    name: string,
    avatar?: string,
  ): Promise<AuthResult> {
    const existingUser = await this.userDAO.findOne({ email } as Partial<User>);
    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds,
    );

    const newUser = await this.userDAO.create({
      email,
      name,
      password: hashedPassword,
      avatar,
    } as Omit<User, "id" | "createdAt" | "updatedAt">);

    const { accessToken, refreshToken } = jwtService.generateTokens(
      newUser.id,
      newUser.email,
    );

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword as Omit<User, "password">,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userDAO.findOne({ email } as Partial<User>);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { accessToken, refreshToken } = jwtService.generateTokens(
      user.id,
      user.email,
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, "password">,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string | undefined): Promise<RefreshResult> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    const decoded = jwtService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const user = await this.userDAO.findOne({ id: decoded.userId } as Partial<User>);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const accessToken = jwtService.generateAccessToken(user.id, user.email);

    return { accessToken };
  }

  async getMe(userId: string): Promise<Omit<User, "password">> {
    const user = await this.userDAO.findOne({ id: userId });
    if (!user) {
      throw new NotFoundError("User nicht gefunden");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
