import { z } from "zod";

export const createMessageSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, "Nachricht darf nicht leer sein")
      .max(4000, "Nachricht darf maximal 4000 Zeichen lang sein"),
  }),
});

export const updateMessageSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
    messageId: z.string().uuid("Ungueltige Nachrichten-ID"),
  }),
  body: z.object({
    content: z
      .string()
      .min(1, "Nachricht darf nicht leer sein")
      .max(4000, "Nachricht darf maximal 4000 Zeichen lang sein"),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
    messageId: z.string().uuid("Ungueltige Nachrichten-ID"),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
  }),
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine((val) => val > 0 && val <= 100, "Limit muss zwischen 1 und 100 liegen"),
    before: z.string().uuid().optional(),
  }),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
