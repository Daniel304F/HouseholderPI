import {
  Message,
  MessageAttachment,
  MessageReaction,
  MessageWithUser,
  MessageResponse,
} from "../models/message.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  InternalError,
} from "./errors.js";

export class MessageService {
  constructor(
    private messageDAO: GenericDAO<Message>,
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>,
  ) {}

  private toDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value as string | number);
  }

  private async verifyGroupMembership(
    groupId: string,
    userId: string,
  ): Promise<Group> {
    const group = await this.groupDAO.findOne({ id: groupId } as Partial<Group>);
    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenError("Kein Mitglied dieser Gruppe");
    }

    return group;
  }

  private toResponse(message: MessageWithUser): MessageResponse {
    return {
      id: message.id,
      groupId: message.groupId,
      userId: message.userId,
      userName: message.userName,
      userAvatar: message.userAvatar,
      content: message.content,
      attachments: (message.attachments || []).map((attachment) => ({
        ...attachment,
        url: `/uploads/${attachment.filename}`,
      })),
      reactions: message.reactions || [],
      createdAt: this.toDate(message.createdAt).toISOString(),
      updatedAt: this.toDate(message.updatedAt).toISOString(),
      editedAt: message.editedAt ? this.toDate(message.editedAt).toISOString() : null,
    };
  }

  private async getMessageWithUserResponse(messageId: string): Promise<MessageResponse> {
    const message = await this.messageDAO.findOne({
      id: messageId,
    } as Partial<Message>);

    if (!message) {
      throw new InternalError("Nachricht konnte nicht gefunden werden");
    }

    const user = await this.userDAO.findOne({ id: message.userId } as Partial<User>);

    const messageWithUser: MessageWithUser = {
      ...message,
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      userName: user?.name || "Unbekannt",
      userAvatar: user?.avatar,
    };

    return this.toResponse(messageWithUser);
  }

  async createMessage(
    groupId: string,
    userId: string,
    content: string,
    attachments: MessageAttachment[] = [],
  ): Promise<MessageResponse> {
    await this.verifyGroupMembership(groupId, userId);

    const normalizedContent = (content || "").trim();
    if (!normalizedContent && attachments.length === 0) {
      throw new BadRequestError("Nachricht darf nicht leer sein");
    }

    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user) {
      throw new NotFoundError("Benutzer nicht gefunden");
    }

    const message = await this.messageDAO.create({
      groupId,
      userId,
      content: normalizedContent,
      editedAt: null,
      attachments,
      reactions: [],
    } as Omit<Message, "id" | "createdAt" | "updatedAt">);

    const messageWithUser: MessageWithUser = {
      ...message,
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      userName: user.name,
      userAvatar: user.avatar,
    };

    return this.toResponse(messageWithUser);
  }

  async getMessages(
    groupId: string,
    userId: string,
    limit: number = 50,
    before?: string,
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    await this.verifyGroupMembership(groupId, userId);

    let messages = await this.messageDAO.findAll({
      groupId,
    } as Partial<Message>);

    messages.sort(
      (a, b) =>
        this.toDate(b.createdAt).getTime() - this.toDate(a.createdAt).getTime(),
    );

    if (before) {
      const beforeIndex = messages.findIndex((m) => m.id === before);
      if (beforeIndex !== -1) {
        messages = messages.slice(beforeIndex + 1);
      }
    }

    const hasMore = messages.length > limit;
    messages = messages.slice(0, limit);

    const uniqueUserIds = [...new Set(messages.map((message) => message.userId))];
    const users = await Promise.all(
      uniqueUserIds.map((id) => this.userDAO.findOne({ id } as Partial<User>)),
    );
    const usersById = new Map<string, User | null>(
      uniqueUserIds.map((id, index) => [id, users[index] ?? null]),
    );

    const enrichedMessages: MessageResponse[] = messages.map((message) => {
      const user = usersById.get(message.userId);
      const messageWithUser: MessageWithUser = {
        ...message,
        attachments: message.attachments || [],
        reactions: message.reactions || [],
        userName: user?.name || "Unbekannt",
        userAvatar: user?.avatar,
      };
      return this.toResponse(messageWithUser);
    });

    enrichedMessages.reverse();

    return { messages: enrichedMessages, hasMore };
  }

  async updateMessage(
    groupId: string,
    messageId: string,
    userId: string,
    content: string,
  ): Promise<MessageResponse> {
    await this.verifyGroupMembership(groupId, userId);

    const message = await this.messageDAO.findOne({
      id: messageId,
      groupId,
    } as Partial<Message>);

    if (!message) {
      throw new NotFoundError("Nachricht nicht gefunden");
    }

    if (message.userId !== userId) {
      throw new ForbiddenError("Nur der Autor kann die Nachricht bearbeiten");
    }

    const now = new Date();
    const updated = await this.messageDAO.update({
      id: messageId,
      content,
      editedAt: now,
      updatedAt: now,
    } as Partial<Message>);

    if (!updated) {
      throw new InternalError("Nachricht konnte nicht aktualisiert werden");
    }

    return this.getMessageWithUserResponse(messageId);
  }

  async deleteMessage(
    groupId: string,
    messageId: string,
    userId: string,
  ): Promise<void> {
    const group = await this.verifyGroupMembership(groupId, userId);

    const message = await this.messageDAO.findOne({
      id: messageId,
      groupId,
    } as Partial<Message>);

    if (!message) {
      throw new NotFoundError("Nachricht nicht gefunden");
    }

    const member = group.members.find((m) => m.userId === userId);
    const isAdminOrOwner = member?.role === "admin" || member?.role === "owner";
    const isAuthor = message.userId === userId;

    if (!isAuthor && !isAdminOrOwner) {
      throw new ForbiddenError(
        "Nur der Autor oder Gruppenadmins koennen die Nachricht loeschen",
      );
    }

    const deleted = await this.messageDAO.delete(messageId);
    if (!deleted) {
      throw new InternalError("Nachricht konnte nicht geloescht werden");
    }
  }

  async addReaction(
    groupId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<MessageResponse> {
    await this.verifyGroupMembership(groupId, userId);

    const normalizedEmoji = emoji.trim();
    if (!normalizedEmoji) {
      throw new BadRequestError("Emoji ist erforderlich");
    }

    const message = await this.messageDAO.findOne({
      id: messageId,
      groupId,
    } as Partial<Message>);

    if (!message) {
      throw new NotFoundError("Nachricht nicht gefunden");
    }

    const reactions = [...(message.reactions || [])];
    const reactionIndex = reactions.findIndex((reaction) => reaction.emoji === normalizedEmoji);

    if (reactionIndex === -1) {
      reactions.push({
        emoji: normalizedEmoji,
        userIds: [userId],
      });
    } else {
      const existingReaction = reactions[reactionIndex]!;
      if (!existingReaction.userIds.includes(userId)) {
        reactions[reactionIndex] = {
          ...existingReaction,
          userIds: [...existingReaction.userIds, userId],
        };
      }
    }

    const updated = await this.messageDAO.update({
      id: messageId,
      reactions,
    } as Partial<Message>);

    if (!updated) {
      throw new InternalError("Reaktion konnte nicht gespeichert werden");
    }

    return this.getMessageWithUserResponse(messageId);
  }

  async removeReaction(
    groupId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<MessageResponse> {
    await this.verifyGroupMembership(groupId, userId);

    const normalizedEmoji = emoji.trim();
    if (!normalizedEmoji) {
      throw new BadRequestError("Emoji ist erforderlich");
    }

    const message = await this.messageDAO.findOne({
      id: messageId,
      groupId,
    } as Partial<Message>);

    if (!message) {
      throw new NotFoundError("Nachricht nicht gefunden");
    }

    const reactions: MessageReaction[] = (message.reactions || [])
      .map((reaction) => {
        if (reaction.emoji !== normalizedEmoji) {
          return reaction;
        }

        return {
          ...reaction,
          userIds: reaction.userIds.filter((id) => id !== userId),
        };
      })
      .filter((reaction) => reaction.userIds.length > 0);

    const updated = await this.messageDAO.update({
      id: messageId,
      reactions,
    } as Partial<Message>);

    if (!updated) {
      throw new InternalError("Reaktion konnte nicht entfernt werden");
    }

    return this.getMessageWithUserResponse(messageId);
  }
}
