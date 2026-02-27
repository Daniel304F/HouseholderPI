import { randomUUID } from "crypto";
import { ForbiddenError } from "./errors.js";

export type GroupMemberRole = "owner" | "admin" | "member";

export type GroupLlmIntent =
  | "chat_summary"
  | "task_creation"
  | "calendar_export"
  | "moderation";

export type GroupLlmAgent =
  | "planner"
  | "summary-agent"
  | "task-agent"
  | "calendar-agent"
  | "moderation-agent"
  | "reviewer";

export interface GroupLlmRequest {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  prompt: string;
  intent: GroupLlmIntent;
  idempotencyKey: string;
}

export interface GroupLlmExecutionPlan {
  runId: string;
  groupId: string;
  userId: string;
  intent: GroupLlmIntent;
  mode: "read" | "write";
  canExecuteTools: boolean;
  toolScopes: string[];
  agents: GroupLlmAgent[];
  createdAt: string;
}

interface IntentWorkflow {
  minRole: GroupMemberRole;
  mode: "read" | "write";
  toolScopes: readonly string[];
  agents: readonly GroupLlmAgent[];
}

const ROLE_PRIORITY: Record<GroupMemberRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

export class GroupLlmCoordinatorService {
  private readonly runsByIdempotencyKey = new Map<string, GroupLlmExecutionPlan>();

  private readonly workflows: Record<GroupLlmIntent, IntentWorkflow> = {
    chat_summary: {
      minRole: "member",
      mode: "read",
      toolScopes: [],
      agents: ["planner", "summary-agent", "reviewer"],
    },
    task_creation: {
      minRole: "member",
      mode: "write",
      toolScopes: ["task.create", "task.assign.suggest"],
      agents: ["planner", "task-agent", "reviewer"],
    },
    calendar_export: {
      minRole: "member",
      mode: "write",
      toolScopes: ["calendar.export"],
      agents: ["planner", "calendar-agent", "reviewer"],
    },
    moderation: {
      minRole: "admin",
      mode: "write",
      toolScopes: ["group.moderate"],
      agents: ["planner", "moderation-agent", "reviewer"],
    },
  };

  coordinate(request: GroupLlmRequest): GroupLlmExecutionPlan {
    const existingRun = this.runsByIdempotencyKey.get(request.idempotencyKey);
    if (existingRun) {
      return existingRun;
    }

    const workflow = this.workflows[request.intent];
    this.ensureRoleAccess(request.role, workflow.minRole, request.intent);

    const plan: GroupLlmExecutionPlan = {
      runId: randomUUID(),
      groupId: request.groupId,
      userId: request.userId,
      intent: request.intent,
      mode: workflow.mode,
      canExecuteTools: workflow.toolScopes.length > 0,
      toolScopes: [...workflow.toolScopes],
      agents: [...workflow.agents],
      createdAt: new Date().toISOString(),
    };

    this.runsByIdempotencyKey.set(request.idempotencyKey, plan);
    return plan;
  }

  private ensureRoleAccess(
    role: GroupMemberRole,
    minRole: GroupMemberRole,
    intent: GroupLlmIntent,
  ): void {
    if (ROLE_PRIORITY[role] < ROLE_PRIORITY[minRole]) {
      throw new ForbiddenError(
        `Intent "${intent}" erfordert mindestens Rolle "${minRole}"`,
      );
    }
  }
}
