import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),

    email: z.string().email("Ungültige E-Mail Adresse"),

    password: z
      .string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten")
      .regex(/[!@#$%^&*]/, "Passwort muss ein Sonderzeichen enthalten"),

    avatar: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Ungültige E-Mail Adresse"),

    password: z.string().min(1, "Passwort darf nicht leer sein"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
