import { User, UserReponse } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { NotFoundError } from "./errors.js";

export interface UpdateProfileInput {
  name?: string;
  avatar?: string | null;
}

export class UserService {
  constructor(private userDAO: GenericDAO<User>) {}

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserReponse> {
    const user = await this.userDAO.findOne({ id: userId });
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

  private toUserResponse(user: User): UserReponse {
    const response: UserReponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // Only include avatar if it's a non-empty string
    if (user.avatar && user.avatar.length > 0) {
      response.avatar = user.avatar;
    }

    return response;
  }
}
