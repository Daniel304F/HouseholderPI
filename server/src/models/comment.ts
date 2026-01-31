import { Entity } from "./entity.js";

export interface Comment extends Entity {
  taskId: string;
  groupId: string;
  userId: string;
  content: string;
  editedAt: Date | null;
}

export interface CommentWithUser extends Comment {
  userName: string;
  userAvatar: string | undefined;
}

export interface CommentResponse {
  id: string;
  taskId: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string | undefined;
  content: string;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
}
