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

export interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface CompletionProof {
  filename: string;
  originalName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  note?: string;
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
  // Attachments
  attachments: TaskAttachment[];
  // Completion proof (optional photo when marking as completed)
  completionProof: CompletionProof | null;
  completedAt: Date | null;
  completedBy: string | null;
}

export interface TaskAttachmentResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface CompletionProofResponse {
  filename: string;
  originalName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  note?: string;
  url: string;
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
  attachments: TaskAttachmentResponse[];
  completionProof: CompletionProofResponse | null;
  completedAt: string | null;
  completedBy: string | null;
}

export interface TaskWithSubtasks extends TaskResponse {
  subtasks: TaskResponse[];
}

export interface TaskWithDetails extends TaskResponse {
  subtasks: TaskResponse[];
  groupName: string;
  assignedToName: string | undefined;
  createdByName: string | undefined;
}
