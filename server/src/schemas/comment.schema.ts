import { z } from "zod";

export const createCommentSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Aufgaben-ID"),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, "Kommentar darf nicht leer sein")
      .max(2000, "Kommentar darf maximal 2000 Zeichen lang sein"),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Aufgaben-ID"),
    commentId: z.string().uuid("Ungültige Kommentar-ID"),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, "Kommentar darf nicht leer sein")
      .max(2000, "Kommentar darf maximal 2000 Zeichen lang sein"),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Aufgaben-ID"),
    commentId: z.string().uuid("Ungültige Kommentar-ID"),
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    taskId: z.string().uuid("Ungültige Aufgaben-ID"),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type GetCommentsInput = z.infer<typeof getCommentsSchema>;
