import { z } from "zod";

const frequencyEnum = z.enum(["daily", "weekly", "biweekly", "monthly"]);
const assignmentStrategyEnum = z.enum(["fixed", "rotation"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

export const createRecurringTaskSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    priority: priorityEnum.default("medium"),
    frequency: frequencyEnum,
    assignmentStrategy: assignmentStrategyEnum,
    fixedAssignee: z.string().optional(),
    rotationOrder: z.array(z.string()).optional(),
    dueDay: z.number().int().min(0).max(31),
  }),
});

export const updateRecurringTaskSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    priority: priorityEnum.optional(),
    frequency: frequencyEnum.optional(),
    assignmentStrategy: assignmentStrategyEnum.optional(),
    fixedAssignee: z.string().nullable().optional(),
    rotationOrder: z.array(z.string()).optional(),
    dueDay: z.number().int().min(0).max(31).optional(),
  }),
});

export const recurringTaskIdSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    id: z.string().min(1),
  }),
});

export const generateTaskSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    id: z.string().min(1),
  }),
  body: z.object({
    assignedTo: z.string().optional(), // Override suggested assignee
  }),
});

export type CreateRecurringTaskInput = z.infer<
  typeof createRecurringTaskSchema
>["body"];
export type UpdateRecurringTaskInput = z.infer<
  typeof updateRecurringTaskSchema
>["body"];
