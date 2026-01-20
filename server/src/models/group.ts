import { Entity } from "./entity.js";

export interface GroupMember {
  userId: string;
  role: "owner" | "admin" | "member";
  isActiveResident: boolean;
  joinedAt: Date;
}

export interface Group extends Entity {
  name: string;
  inviteCode: string;
  members: GroupMember[];
  activeResidentsCount: number;
  picture?: string; // URL zum Bild (empfohlen) oder Base64-String
}

export interface GroupResponse {
  id: string;
  name: string;
  inviteCode: string;
  members: GroupMember[];
  activeResidentsCount: number;
  picture?: string;
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
