import { Entity } from "./entity.js";

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface MessageAttachmentResponse extends MessageAttachment {
  url: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message extends Entity {
  groupId: string;
  userId: string;
  content: string;
  editedAt: Date | null;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
}

export interface MessageWithUser extends Message {
  userName: string;
  userAvatar: string | undefined;
}

export interface MessageResponse {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string | undefined;
  content: string;
  attachments: MessageAttachmentResponse[];
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
}
