import { z } from "zod";

// Task Link Type Enum
const taskLinkTypeEnum = z.enum([
  "blocks",
  "blocked-by",
  "relates-to",
  "duplicates",
  "duplicated-by",
]);

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
    parentTaskId: z
      .string()
      .uuid("Ungültige Parent-Task-ID")
      .nullable()
      .optional(),
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
    parentTaskId: z
      .string()
      .uuid("Ungültige Parent-Task-ID")
      .nullable()
      .optional(),
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

// Schema für Subtask erstellen
export const createSubtaskSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Parent-Task-ID"),
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

// Schema für Task-Verknüpfung
export const linkTaskSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Task-ID"),
  }),
  body: z.object({
    targetTaskId: z.string().uuid("Ungültige Ziel-Task-ID"),
    linkType: taskLinkTypeEnum,
  }),
});

// Schema für Task-Verknüpfung entfernen
export const unlinkTaskSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Task-ID"),
    linkedTaskId: z.string().uuid("Ungültige verknüpfte Task-ID"),
  }),
});

// Schema für Meine Aufgaben
export const myTasksQuerySchema = z.object({
  query: z
    .object({
      status: z.enum(["pending", "in-progress", "completed"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    })
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type AssignTaskInput = z.infer<typeof assignTaskSchema>["body"];
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>["body"];
export type LinkTaskInput = z.infer<typeof linkTaskSchema>["body"];
export type TaskLinkType = z.infer<typeof taskLinkTypeEnum>;
