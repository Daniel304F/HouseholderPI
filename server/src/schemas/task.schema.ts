import { z } from "zod";

export const createTaskSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, "Titel ist erforderlich")
      .max(100, "Titel darf maximal 100 Zeichen lang sein"),
    description: z
      .string()
      .max(1000, "Beschreibung darf maximal 1000 Zeichen lang sein")
      .optional(),
    status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    assignedTo: z.string().uuid("Ungültige User-ID").nullable().optional(),
    dueDate: z.string().datetime("Ungültiges Datumsformat"),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Task-ID"),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, "Titel ist erforderlich")
      .max(100, "Titel darf maximal 100 Zeichen lang sein")
      .optional(),
    description: z
      .string()
      .max(1000, "Beschreibung darf maximal 1000 Zeichen lang sein")
      .optional(),
    status: z.enum(["pending", "in-progress", "completed"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assignedTo: z.string().uuid("Ungültige User-ID").nullable().optional(),
    dueDate: z.string().datetime("Ungültiges Datumsformat").optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Task-ID"),
  }),
});

export const groupTasksParamSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Task-ID"),
  }),
  body: z.object({
    assignedTo: z.string().uuid("Ungültige User-ID").nullable(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type AssignTaskInput = z.infer<typeof assignTaskSchema>["body"];
