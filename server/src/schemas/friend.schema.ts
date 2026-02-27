import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  body: z.object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
  }),
});

export const friendRequestIdParamSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "Request ID ist erforderlich"),
  }),
});

export const friendIdParamSchema = z.object({
  params: z.object({
    friendId: z.string().min(1, "Friend ID ist erforderlich"),
  }),
});

export const respondToRequestSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "Request ID ist erforderlich"),
  }),
  body: z.object({
    accept: z.boolean(),
  }),
});

export const directMessagesQuerySchema = z.object({
  params: z.object({
    friendId: z.string().min(1, "Friend ID ist erforderlich"),
  }),
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine((val) => val > 0 && val <= 100, "Limit muss zwischen 1 und 100 liegen"),
    before: z.string().optional(),
  }),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type FriendRequestIdParamInput = z.infer<
  typeof friendRequestIdParamSchema
>;
export type FriendIdParamInput = z.infer<typeof friendIdParamSchema>;
export type RespondToRequestInput = z.infer<typeof respondToRequestSchema>;
export type DirectMessagesQueryInput = z.infer<typeof directMessagesQuerySchema>;
