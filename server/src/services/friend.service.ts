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
import {
  DirectMessage,
  DirectMessageAttachment,
  DirectMessageResponse,
} from "../models/directMessage.js";

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

export interface FriendProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  achievements: string[];
  friendSince: string;
}

export class FriendService {
  constructor(
    private friendshipDAO: GenericDAO<Friendship>,
    private userDAO: GenericDAO<User>,
    private directMessageDAO: GenericDAO<DirectMessage>,
  ) {}

  private async ensureFriendship(
    userId: string,
    friendId: string,
  ): Promise<Friendship> {
    const allFriendships = await this.friendshipDAO.findAll();
    const friendship = allFriendships.find(
      (f) =>
        ((f.requesterId === userId && f.addresseeId === friendId) ||
          (f.requesterId === friendId && f.addresseeId === userId)) &&
        f.status === "accepted",
    );

    if (!friendship) {
      throw new ForbiddenError("Nur Freunde koennen darauf zugreifen");
    }

    return friendship;
  }

  private async getUserOrThrow(userId: string): Promise<User> {
    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user) {
      throw new NotFoundError("Benutzer nicht gefunden");
    }
    return user;
  }

  private toDirectMessageResponse(
    message: DirectMessage,
    sender: User,
  ): DirectMessageResponse {
    return {
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      senderName: sender.name,
      ...(sender.avatar && { senderAvatar: sender.avatar }),
      content: message.content,
      attachments: (message.attachments || []).map((attachment) => ({
        ...attachment,
        url: `/uploads/${attachment.filename}`,
      })),
      createdAt: toISOString(message.createdAt),
      updatedAt: toISOString(message.updatedAt),
      readAt: message.readAt ? toISOString(message.readAt) : null,
    };
  }

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
        "Du kannst nur deine eigenen Anfragen zurueckziehen",
      );
    }

    if (friendship.status !== "pending") {
      throw new BadRequestError(
        "Diese Anfrage kann nicht mehr zurueckgezogen werden",
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

  async getFriendProfile(
    userId: string,
    friendId: string,
  ): Promise<FriendProfileResponse> {
    const friend = await this.getUserOrThrow(friendId);
    const friendship = await this.ensureFriendship(userId, friendId);

    return {
      id: friend.id,
      name: friend.name,
      email: friend.email,
      ...(friend.avatar && { avatar: friend.avatar }),
      ...(friend.bio && { bio: friend.bio }),
      achievements: friend.achievements || [],
      friendSince: toISOString(friendship.createdAt),
    };
  }

  async getDirectMessages(
    userId: string,
    friendId: string,
    limit: number = 50,
    before?: string,
  ): Promise<{ messages: DirectMessageResponse[]; hasMore: boolean }> {
    await this.getUserOrThrow(friendId);
    await this.ensureFriendship(userId, friendId);

    let messages = await this.directMessageDAO.findAll();
    messages = messages
      .filter(
        (message) =>
          (message.senderId === userId && message.recipientId === friendId) ||
          (message.senderId === friendId && message.recipientId === userId),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (before) {
      const beforeIndex = messages.findIndex((message) => message.id === before);
      if (beforeIndex !== -1) {
        messages = messages.slice(beforeIndex + 1);
      }
    }

    const hasMore = messages.length > limit;
    messages = messages.slice(0, limit);

    const [currentUser, friendUser] = await Promise.all([
      this.getUserOrThrow(userId),
      this.getUserOrThrow(friendId),
    ]);
    const usersById = new Map<string, User>([
      [currentUser.id, currentUser],
      [friendUser.id, friendUser],
    ]);

    const response = messages
      .map((message) => {
        const sender = usersById.get(message.senderId);
        if (!sender) return null;
        return this.toDirectMessageResponse(message, sender);
      })
      .filter((message): message is DirectMessageResponse => Boolean(message))
      .reverse();

    return {
      messages: response,
      hasMore,
    };
  }

  async sendDirectMessage(
    userId: string,
    friendId: string,
    content: string,
    attachments: DirectMessageAttachment[] = [],
  ): Promise<DirectMessageResponse> {
    await this.getUserOrThrow(friendId);
    await this.ensureFriendship(userId, friendId);

    const trimmedContent = content.trim();
    if (!trimmedContent && attachments.length === 0) {
      throw new BadRequestError("Nachricht darf nicht leer sein");
    }

    const createdMessage = await this.directMessageDAO.create({
      senderId: userId,
      recipientId: friendId,
      content: trimmedContent,
      attachments,
      readAt: null,
    } as Omit<DirectMessage, "id" | "createdAt" | "updatedAt">);

    const sender = await this.getUserOrThrow(userId);
    return this.toDirectMessageResponse(createdMessage, sender);
  }
}
