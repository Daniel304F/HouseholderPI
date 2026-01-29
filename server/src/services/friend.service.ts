import {
  Friendship,
  FriendshipResponse,
  FriendRequest,
} from "../models/friend.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { toISOString } from "../helpers/index.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "./errors.js";

export interface SentFriendRequest {
  id: string;
  to: {
    id: string;
    name: string;
    email: string;
    avatar: string | undefined;
  };
  createdAt: string;
}

export class FriendService {
  constructor(
    private friendshipDAO: GenericDAO<Friendship>,
    private userDAO: GenericDAO<User>,
  ) {}

  async getFriends(userId: string): Promise<FriendshipResponse[]> {
    const allFriendships = await this.friendshipDAO.findAll();

    const userFriendships = allFriendships.filter(
      (f) =>
        (f.requesterId === userId || f.addresseeId === userId) &&
        f.status === "accepted",
    );

    const friends: FriendshipResponse[] = await Promise.all(
      userFriendships.map(async (friendship) => {
        const friendId =
          friendship.requesterId === userId
            ? friendship.addresseeId
            : friendship.requesterId;

        const friend = await this.userDAO.findOne({
          id: friendId,
        } as Partial<User>);

        return {
          id: friendship.id,
          friendId,
          friendName: friend?.name || "Unbekannt",
          friendEmail: friend?.email || "",
          friendAvatar: friend?.avatar,
          status: friendship.status,
          isRequester: friendship.requesterId === userId,
          createdAt: toISOString(friendship.createdAt),
          updatedAt: toISOString(friendship.updatedAt),
        };
      }),
    );

    return friends;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const allFriendships = await this.friendshipDAO.findAll();

    const pendingRequests = allFriendships.filter(
      (f) => f.addresseeId === userId && f.status === "pending",
    );

    const requests: FriendRequest[] = await Promise.all(
      pendingRequests.map(async (friendship) => {
        const requester = await this.userDAO.findOne({
          id: friendship.requesterId,
        } as Partial<User>);

        return {
          id: friendship.id,
          from: {
            id: friendship.requesterId,
            name: requester?.name || "Unbekannt",
            email: requester?.email || "",
            avatar: requester?.avatar,
          },
          createdAt: toISOString(friendship.createdAt),
        };
      }),
    );

    return requests;
  }

  async getSentRequests(userId: string): Promise<SentFriendRequest[]> {
    const allFriendships = await this.friendshipDAO.findAll();

    const sentRequests = allFriendships.filter(
      (f) => f.requesterId === userId && f.status === "pending",
    );

    const requests = await Promise.all(
      sentRequests.map(async (friendship) => {
        const addressee = await this.userDAO.findOne({
          id: friendship.addresseeId,
        } as Partial<User>);

        return {
          id: friendship.id,
          to: {
            id: friendship.addresseeId,
            name: addressee?.name || "Unbekannt",
            email: addressee?.email || "",
            avatar: addressee?.avatar,
          },
          createdAt: toISOString(friendship.createdAt),
        };
      }),
    );

    return requests;
  }

  async sendFriendRequest(
    userId: string,
    email: string,
  ): Promise<{ friendship: Friendship; message: string }> {
    const targetUser = await this.userDAO.findOne({ email } as Partial<User>);

    if (!targetUser) {
      throw new NotFoundError("Benutzer nicht gefunden");
    }

    if (targetUser.id === userId) {
      throw new BadRequestError(
        "Du kannst dir selbst keine Freundschaftsanfrage senden",
      );
    }

    const allFriendships = await this.friendshipDAO.findAll();
    const existingFriendship = allFriendships.find(
      (f) =>
        (f.requesterId === userId && f.addresseeId === targetUser.id) ||
        (f.requesterId === targetUser.id && f.addresseeId === userId),
    );

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        throw new BadRequestError("Ihr seid bereits Freunde");
      }
      if (existingFriendship.status === "pending") {
        throw new BadRequestError(
          "Es existiert bereits eine ausstehende Anfrage",
        );
      }
      if (existingFriendship.status === "rejected") {
        await this.friendshipDAO.delete(existingFriendship.id);
      }
    }

    const newFriendship = await this.friendshipDAO.create({
      requesterId: userId,
      addresseeId: targetUser.id,
      status: "pending",
    } as Omit<Friendship, "id" | "createdAt" | "updatedAt">);

    return {
      friendship: newFriendship,
      message: "Freundschaftsanfrage gesendet",
    };
  }

  async respondToRequest(
    requestId: string,
    userId: string,
    accept: boolean,
  ): Promise<string> {
    const friendship = await this.friendshipDAO.findOne({
      id: requestId,
    } as Partial<Friendship>);

    if (!friendship) {
      throw new NotFoundError("Anfrage nicht gefunden");
    }

    if (friendship.addresseeId !== userId) {
      throw new ForbiddenError(
        "Du bist nicht berechtigt, diese Anfrage zu beantworten",
      );
    }

    if (friendship.status !== "pending") {
      throw new BadRequestError("Diese Anfrage wurde bereits beantwortet");
    }

    const updated = await this.friendshipDAO.update({
      id: requestId,
      status: accept ? "accepted" : "rejected",
    } as Partial<Friendship>);

    if (!updated) {
      throw new InternalError("Fehler beim Aktualisieren der Anfrage");
    }

    return accept
      ? "Freundschaftsanfrage angenommen"
      : "Freundschaftsanfrage abgelehnt";
  }

  async cancelRequest(requestId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipDAO.findOne({
      id: requestId,
    } as Partial<Friendship>);

    if (!friendship) {
      throw new NotFoundError("Anfrage nicht gefunden");
    }

    if (friendship.requesterId !== userId) {
      throw new ForbiddenError(
        "Du kannst nur deine eigenen Anfragen zurückziehen",
      );
    }

    if (friendship.status !== "pending") {
      throw new BadRequestError(
        "Diese Anfrage kann nicht mehr zurückgezogen werden",
      );
    }

    await this.friendshipDAO.delete(requestId);
  }

  async removeFriend(friendId: string, userId: string): Promise<void> {
    const allFriendships = await this.friendshipDAO.findAll();
    const friendship = allFriendships.find(
      (f) =>
        ((f.requesterId === userId && f.addresseeId === friendId) ||
          (f.requesterId === friendId && f.addresseeId === userId)) &&
        f.status === "accepted",
    );

    if (!friendship) {
      throw new NotFoundError("Freundschaft nicht gefunden");
    }

    await this.friendshipDAO.delete(friendship.id);
  }
}
