import { z } from "zod";

export const subscribeSchema = z.object({
  body: z.object({
    endpoint: z.string().url("Ungueltiger Endpoint"),
    keys: z.object({
      p256dh: z.string().min(1, "p256dh Key erforderlich"),
      auth: z.string().min(1, "Auth Key erforderlich"),
    }),
  }),
});

export const unsubscribeSchema = z.object({
  body: z.object({
    endpoint: z.string().url("Ungueltiger Endpoint"),
  }),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>["body"];
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>["body"];
