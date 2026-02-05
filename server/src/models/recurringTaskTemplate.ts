import { Entity } from "./entity.js";
import { TaskAttachment, TaskPriority } from "./task.js";

export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type AssignmentStrategy = "fixed" | "rotation";

export interface RecurringTaskTemplate extends Entity {
  groupId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  frequency: RecurringFrequency;
  assignmentStrategy: AssignmentStrategy;
  fixedAssignee?: string;
  rotationOrder?: string[]; // UserIds in rotation order
  currentRotationIndex: number;
  dueDays: number[]; // Days of week (0-6) or days of month (1-31)
  isActive: boolean;
  lastGeneratedAt?: Date;
  createdBy: string;
  attachments?: TaskAttachment[]; // Attachments to be copied to generated tasks
}

export interface RecurringTaskTemplateResponse {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  frequency: RecurringFrequency;
  assignmentStrategy: AssignmentStrategy;
  fixedAssignee?: string;
  rotationOrder?: string[];
  currentRotationIndex: number;
  dueDays: number[];
  isActive: boolean;
  lastGeneratedAt?: string;
  nextSuggestedAssignee?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: TaskAttachment[];
}
