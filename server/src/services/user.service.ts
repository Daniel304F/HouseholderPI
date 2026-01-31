import { User, UserReponse } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { toISOString } from "../helpers/index.js";
import bcrypt from "bcrypt";
import config from "../config/config.js";

export interface UpdateProfileInput {
  name?: string;
  avatar?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailInput {
  newEmail: string;
  password: string;
}

export class UserService {
  constructor(private userDAO: GenericDAO<User>) {}

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserReponse> {
    console.log("updateProfile service - searching for userId:", userId);
    const user = await this.userDAO.findOne({ id: userId });
    console.log("updateProfile service - found user:", user ? "yes" : "no");
    if (!user) {
      throw new NotFoundError("User nicht gefunden");
    }

    const updateData: Partial<User> = { id: userId };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.avatar !== undefined) {
      // Handle null as explicit removal, empty string removes avatar
      if (data.avatar === null || data.avatar === "") {
        updateData.avatar = "";
      } else {
        updateData.avatar = data.avatar;
      }
    }

    const success = await this.userDAO.update(updateData);
    if (!success) {
      throw new NotFoundError("User konnte nicht aktualisiert werden");
    }

    // Fetch updated user
    const updatedUser = await this.userDAO.findOne({ id: userId });
    if (!updatedUser) {
      throw new NotFoundError("User nicht gefunden");
    }

    return this.toUserResponse(updatedUser);
  }

  async removeAvatar(userId: string): Promise<UserReponse> {
    const user = await this.userDAO.findOne({ id: userId });
    if (!user) {
      throw new NotFoundError("User nicht gefunden");
    }

    const success = await this.userDAO.update({
      id: userId,
      avatar: "",
    });
    if (!success) {
      throw new NotFoundError("Avatar konnte nicht entfernt werden");
    }

    // Fetch updated user
    const updatedUser = await this.userDAO.findOne({ id: userId });
    if (!updatedUser) {
      throw new NotFoundError("User nicht gefunden");
    }

    return this.toUserResponse(updatedUser);
  }

  async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    const user = await this.userDAO.findOne({ id: userId });
    if (!user) {
      throw new NotFoundError("User nicht gefunden");
    }

    const isValidPassword = await bcrypt.compare(
      data.currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new BadRequestError("Aktuelles Passwort ist falsch");
    }

    const hashedPassword = await bcrypt.hash(
      data.newPassword,
      config.bcrypt.saltRounds
    );

    const success = await this.userDAO.update({
      id: userId,
      password: hashedPassword,
    });
    if (!success) {
      throw new NotFoundError("Passwort konnte nicht geändert werden");
    }
  }

  async changeEmail(userId: string, data: ChangeEmailInput): Promise<UserReponse> {
    const user = await this.userDAO.findOne({ id: userId });
    if (!user) {
      throw new NotFoundError("User nicht gefunden");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError("Passwort ist falsch");
    }

    // Check if email is already taken
    const existingUser = await this.userDAO.findOne({ email: data.newEmail });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestError("E-Mail-Adresse wird bereits verwendet");
    }

    const success = await this.userDAO.update({
      id: userId,
      email: data.newEmail,
    });
    if (!success) {
      throw new NotFoundError("E-Mail konnte nicht geändert werden");
    }

    const updatedUser = await this.userDAO.findOne({ id: userId });
    if (!updatedUser) {
      throw new NotFoundError("User nicht gefunden");
    }

    return this.toUserResponse(updatedUser);
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.userDAO.findOne({ id: userId });
    if (!user) {
      throw new NotFoundError("User nicht gefunden");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError("Passwort ist falsch");
    }

    const success = await this.userDAO.delete(userId);
    if (!success) {
      throw new NotFoundError("Konto konnte nicht gelöscht werden");
    }
  }

  private toUserResponse(user: User): UserReponse {
    const response: UserReponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: toISOString(user.createdAt),
      updatedAt: toISOString(user.updatedAt),
    };

    // Only include avatar if it's a non-empty string
    if (user.avatar && user.avatar.length > 0) {
      response.avatar = user.avatar;
    }

    return response;
  }
}
