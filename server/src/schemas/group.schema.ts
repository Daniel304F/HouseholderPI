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
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
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
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
    memberId: z.string().uuid("Ungueltige Mitglieds-ID"),
  }),
  body: z.object({
    role: z.enum(["admin", "member"]).optional(),
    isActiveResident: z.boolean().optional(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
    memberId: z.string().uuid("Ungueltige Mitglieds-ID"),
  }),
});

const permissionLevel = z.enum(["owner", "admin", "member", "nobody"]);

export const updatePermissionsSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
  }),
  body: z.object({
    createTask: permissionLevel.optional(),
    assignTask: permissionLevel.optional(),
    deleteTask: permissionLevel.optional(),
    editTask: permissionLevel.optional(),
    manageRecurringTasks: permissionLevel.optional(),
  }),
});

const llmProvider = z.enum([
  "openai",
  "anthropic",
  "google",
  "openrouter",
  "custom",
]);

const llmCoordinationMode = z.enum(["planner", "multi_agent"]);
const llmAgentFramework = z.enum([
  "langgraph",
  "autogen",
  "semantic-kernel",
  "custom",
]);

export const updateGroupLlmConfigSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
  }),
  body: z.object({
    enabled: z.boolean().optional(),
    provider: llmProvider.optional(),
    model: z
      .string()
      .min(2, "Model muss mindestens 2 Zeichen lang sein")
      .max(120)
      .optional(),
    apiKey: z.string().min(8, "API-Key scheint zu kurz").max(500).optional(),
    coordinationMode: llmCoordinationMode.optional(),
    agentFramework: llmAgentFramework.optional(),
    dataAccess: z
      .object({
        includeTasks: z.boolean().optional(),
        includeMessages: z.boolean().optional(),
        includeMemberProfiles: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const groupLlmCoordinateSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Ungueltige Gruppen-ID"),
  }),
  body: z.object({
    prompt: z.string().min(1, "Prompt darf nicht leer sein").max(4000),
    intent: z.enum([
      "chat_summary",
      "task_creation",
      "calendar_export",
      "moderation",
    ]),
    idempotencyKey: z.string().min(1).max(200).optional(),
  }),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>["body"];
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>["body"];
export type JoinGroupInput = z.infer<typeof joinGroupSchema>["body"];
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>["body"];
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>["body"];
export type UpdateGroupLlmConfigInput = z.infer<typeof updateGroupLlmConfigSchema>["body"];
export type GroupLlmCoordinateInput = z.infer<typeof groupLlmCoordinateSchema>["body"];
