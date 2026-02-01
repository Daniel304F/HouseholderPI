import { Entity } from "./entity.js";

export interface Message extends Entity {
  groupId: string;
  userId: string;
  content: string;
  editedAt: Date | null;
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
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
}
