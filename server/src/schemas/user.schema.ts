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

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Aktuelles Passwort erforderlich"),
    newPassword: z
      .string()
      .min(8, "Neues Passwort muss mindestens 8 Zeichen lang sein")
      .max(100, "Passwort darf maximal 100 Zeichen lang sein"),
  }),
});

export const changeEmailSchema = z.object({
  body: z.object({
    newEmail: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(1, "Passwort erforderlich"),
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Passwort erforderlich"),
    confirmation: z.literal("DELETE", 'Bitte "DELETE" eingeben zur Bestätigung'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>["body"];
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>["body"];
