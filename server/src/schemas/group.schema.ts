import { z } from "zod";

export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Gruppenname muss mindestens 2 Zeichen lang sein")
      .max(50, "Gruppenname darf maximal 50 Zeichen lang sein"),
    picture: z.string().optional(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Gruppenname muss mindestens 2 Zeichen lang sein")
      .max(50, "Gruppenname darf maximal 50 Zeichen lang sein")
      .optional(),
    picture: z.string().optional(),
  }),
});

export const joinGroupSchema = z.object({
  body: z.object({
    inviteCode: z
      .string()
      .min(6, "Invite-Code muss mindestens 6 Zeichen lang sein"),
  }),
});

export const groupIdParamSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    memberId: z.string().uuid("Ungültige Mitglieds-ID"),
  }),
  body: z.object({
    role: z.enum(["admin", "member"]).optional(),
    isActiveResident: z.boolean().optional(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungültige Gruppen-ID"),
    memberId: z.string().uuid("Ungültige Mitglieds-ID"),
  }),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>["body"];
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>["body"];
export type JoinGroupInput = z.infer<typeof joinGroupSchema>["body"];
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>["body"];
