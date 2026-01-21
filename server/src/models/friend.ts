import { Entity } from "./entity.js";

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export interface Friendship extends Entity {
  requesterId: string; // User who sent the request
  addresseeId: string; // User who received the request
  status: FriendshipStatus;
}

export interface FriendshipResponse {
  id: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  friendAvatar?: string;
  status: FriendshipStatus;
  isRequester: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  from: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}
