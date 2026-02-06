import { z } from "zod";

export const subscribeSchema = z.object({
  body: z.object({
    endpoint: z.string().url("Ungültiger Endpoint"),
    keys: z.object({
      p256dh: z.string().min(1, "p256dh Key erforderlich"),
      auth: z.string().min(1, "Auth Key erforderlich"),
    }),
  }),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>["body"];
