import { Entity } from "./entity.js";

export interface DirectMessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface DirectMessageAttachmentResponse extends DirectMessageAttachment {
  url: string;
}

export interface DirectMessage extends Entity {
  senderId: string;
  recipientId: string;
  content: string;
  attachments: DirectMessageAttachment[];
  readAt: Date | null;
}

export interface DirectMessageResponse {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments: DirectMessageAttachmentResponse[];
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
}
