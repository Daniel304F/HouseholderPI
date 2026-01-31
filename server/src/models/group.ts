import { Entity } from "./entity.js";

export type GroupRole = "owner" | "admin" | "member";
export type PermissionLevel = "owner" | "admin" | "member" | "nobody";

export interface GroupPermissions {
  createTask: PermissionLevel;
  assignTask: PermissionLevel;
  deleteTask: PermissionLevel;
  editTask: PermissionLevel;
  manageRecurringTasks: PermissionLevel;
}

export const DEFAULT_PERMISSIONS: GroupPermissions = {
  createTask: "member",
  assignTask: "member",
  deleteTask: "admin",
  editTask: "member",
  manageRecurringTasks: "admin",
};

export interface GroupMember {
  userId: string;
  role: GroupRole;
  isActiveResident: boolean;
  joinedAt: Date;
}

// GroupMember with user info for API responses
export interface GroupMemberWithUser extends GroupMember {
  userName?: string;
  userAvatar?: string;
}

export interface Group extends Entity {
  name: string;
  inviteCode: string;
  members: GroupMember[];
  activeResidentsCount: number;
  picture?: string; // URL zum Bild (empfohlen) oder Base64-String
  permissions: GroupPermissions;
}

export interface GroupResponse {
  id: string;
  name: string;
  inviteCode: string;
  members: GroupMember[];
  activeResidentsCount: number;
  picture?: string;
  permissions: GroupPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface GroupListItem {
  id: string;
  name: string;
  memberCount: number;
  activeResidentsCount: number;
  picture: string | undefined;
  role: GroupMember["role"];
}
