import { Entity } from "./entity.js";

export type ActivityType = "created" | "assigned" | "updated" | "completed";

export interface ActivityLog extends Entity {
  userId: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  groupId: string;
  groupName: string;
  details?: string;
}

export interface ActivityLogResponse {
  id: string;
  userId: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  groupId: string;
  groupName: string;
  details?: string;
  createdAt: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // Color intensity
}
