import {
  Message,
  MessageWithUser,
  MessageResponse,
} from "../models/message.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import {
  NotFoundError,
  ForbiddenError,
  InternalError,
} from "./errors.js";

export class MessageService {
  constructor(
    private messageDAO: GenericDAO<Message>,
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>
  ) {}

  private toDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value as string | number);
  }

  private async verifyGroupMembership(
    groupId: string,
    userId: string
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
      createdAt: this.toDate(message.createdAt).toISOString(),
      updatedAt: this.toDate(message.updatedAt).toISOString(),
      editedAt: message.editedAt ? this.toDate(message.editedAt).toISOString() : null,
    };
  }

  async createMessage(
    groupId: string,
    userId: string,
    content: string
  ): Promise<MessageResponse> {
    await this.verifyGroupMembership(groupId, userId);

    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user) {
      throw new NotFoundError("Benutzer nicht gefunden");
    }

    const message = await this.messageDAO.create({
      groupId,
      userId,
      content,
      editedAt: null,
    } as Omit<Message, "id" | "createdAt" | "updatedAt">);

    const messageWithUser: MessageWithUser = {
      ...message,
      userName: user.name,
      userAvatar: user.avatar,
    };

    return this.toResponse(messageWithUser);
  }

  async getMessages(
    groupId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    await this.verifyGroupMembership(groupId, userId);

    let messages = await this.messageDAO.findAll({
      groupId,
    } as Partial<Message>);

    // Sort by createdAt descending (newest first)
    messages.sort(
      (a, b) =>
        this.toDate(b.createdAt).getTime() - this.toDate(a.createdAt).getTime(),
    );

    // If before is provided, filter messages before that ID
    if (before) {
      const beforeIndex = messages.findIndex((m) => m.id === before);
      if (beforeIndex !== -1) {
        messages = messages.slice(beforeIndex + 1);
      }
    }

    // Check if there are more messages
    const hasMore = messages.length > limit;

    // Limit the results
    messages = messages.slice(0, limit);

    // Enrich with user info
    const enrichedMessages: MessageResponse[] = [];
    for (const message of messages) {
      const user = await this.userDAO.findOne({
        id: message.userId,
      } as Partial<User>);

      const messageWithUser: MessageWithUser = {
        ...message,
        userName: user?.name || "Unbekannt",
        userAvatar: user?.avatar,
      };

      enrichedMessages.push(this.toResponse(messageWithUser));
    }

    // Reverse to have oldest first in the returned array
    enrichedMessages.reverse();

    return { messages: enrichedMessages, hasMore };
  }

  async updateMessage(
    groupId: string,
    messageId: string,
    userId: string,
    content: string
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

    // Fetch updated message
    const updatedMessage = await this.messageDAO.findOne({
      id: messageId,
    } as Partial<Message>);

    if (!updatedMessage) {
      throw new InternalError("Nachricht konnte nicht gefunden werden");
    }

    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);

    const messageWithUser: MessageWithUser = {
      ...updatedMessage,
      userName: user?.name || "Unbekannt",
      userAvatar: user?.avatar,
    };

    return this.toResponse(messageWithUser);
  }

  async deleteMessage(
    groupId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const group = await this.verifyGroupMembership(groupId, userId);

    const message = await this.messageDAO.findOne({
      id: messageId,
      groupId,
    } as Partial<Message>);

    if (!message) {
      throw new NotFoundError("Nachricht nicht gefunden");
    }

    // Allow deletion by message author or group admins/owners
    const member = group.members.find((m) => m.userId === userId);
    const isAdminOrOwner =
      member?.role === "admin" || member?.role === "owner";
    const isAuthor = message.userId === userId;

    if (!isAuthor && !isAdminOrOwner) {
      throw new ForbiddenError(
        "Nur der Autor oder Gruppenadmins können die Nachricht löschen"
      );
    }

    const deleted = await this.messageDAO.delete(messageId);
    if (!deleted) {
      throw new InternalError("Nachricht konnte nicht gelöscht werden");
    }
  }
}
