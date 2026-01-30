import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name muss mindestens 2 Zeichen lang sein")
      .max(50, "Name darf maximal 50 Zeichen lang sein")
      .optional(),
    avatar: z.string().optional().nullable(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
