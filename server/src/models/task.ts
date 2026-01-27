import { Entity } from "./entity.js";

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskLinkType =
  | "blocks"
  | "blocked-by"
  | "relates-to"
  | "duplicates"
  | "duplicated-by";

export interface TaskLink {
  taskId: string;
  linkType: TaskLinkType;
}

export interface Task extends Entity {
  groupId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  dueDate: Date;
  createdBy: string;
  // Subtask support
  parentTaskId: string | null;
  // Task linking
  linkedTasks: TaskLink[];
}

export interface TaskResponse {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  parentTaskId: string | null;
  linkedTasks: TaskLink[];
}

export interface TaskWithSubtasks extends TaskResponse {
  subtasks: TaskResponse[];
}

export interface TaskWithDetails extends TaskResponse {
  subtasks: TaskResponse[];
  groupName?: string;
  assignedToName?: string;
  createdByName?: string;
}
