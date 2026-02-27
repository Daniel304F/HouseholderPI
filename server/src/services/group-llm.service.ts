import { createCipheriv, createHash, randomBytes, randomUUID } from "crypto";
import { GenericDAO } from "../models/generic.dao.js";
import { Group, GroupRole } from "../models/group.js";
import {
  DEFAULT_GROUP_LLM_DATA_ACCESS,
  GroupLlmAgentFramework,
  GroupLlmConfig,
  GroupLlmConfigResponse,
  GroupLlmCoordinationMode,
  GroupLlmDataAccess,
  GroupLlmProvider,
} from "../models/groupLlmConfig.js";
import { Message } from "../models/message.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "./errors.js";
import {
  GroupLlmCoordinatorService,
  GroupLlmExecutionPlan,
  GroupLlmIntent,
} from "./group-llm-coordinator.service.js";
import config from "../config/config.js";

export interface UpdateGroupLlmConfigInput {
  enabled?: boolean;
  provider?: GroupLlmProvider;
  model?: string;
  apiKey?: string;
  coordinationMode?: GroupLlmCoordinationMode;
  agentFramework?: GroupLlmAgentFramework;
  dataAccess?: Partial<GroupLlmDataAccess>;
}

export interface CoordinateGroupLlmInput {
  prompt: string;
  intent: GroupLlmIntent;
  idempotencyKey?: string;
}

interface GroupLlmContextProfile {
  userId: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  achievements: string[];
}

interface GroupLlmContextTask {
  id: string;
  title: string;
  status: Task["status"];
  priority: Task["priority"];
  assignedTo: string | null;
  dueDate: string;
}

interface GroupLlmContextMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface GroupLlmCoordinationResponse {
  plan: GroupLlmExecutionPlan;
  runtime: {
    provider: GroupLlmProvider;
    model: string;
    coordinationMode: GroupLlmCoordinationMode;
    agentFramework: GroupLlmAgentFramework;
    frameworkRecommendation: string;
    hasApiKey: boolean;
  };
  context: {
    group: {
      id: string;
      name: string;
      memberCount: number;
      activeResidentsCount: number;
    };
    tasks: GroupLlmContextTask[];
    messages: GroupLlmContextMessage[];
    memberProfiles: GroupLlmContextProfile[];
  };
}

const DEFAULT_PROVIDER: GroupLlmProvider = "openai";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_COORDINATION_MODE: GroupLlmCoordinationMode = "multi_agent";
const DEFAULT_AGENT_FRAMEWORK: GroupLlmAgentFramework = "langgraph";

const ROLE_PRIORITY: Record<GroupRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

const hasMinimumRole = (currentRole: GroupRole, minimumRole: GroupRole): boolean => {
  return ROLE_PRIORITY[currentRole] >= ROLE_PRIORITY[minimumRole];
};

const toIso = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value as string | number).toISOString();
};

const isDefined = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;

const maskApiKey = (apiKey: string): string => {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return "";
  }
  const suffix = trimmed.slice(-4);
  return `****-${suffix}`;
};

const getFrameworkRecommendation = (
  coordinationMode: GroupLlmCoordinationMode,
  framework: GroupLlmAgentFramework,
): string => {
  if (coordinationMode === "planner") {
    return "Single planner flow. Keep orchestration simple and deterministic.";
  }

  switch (framework) {
    case "langgraph":
      return "LangGraph is a strong default for multi-agent stateful workflows.";
    case "autogen":
      return "AutoGen works well for conversational multi-agent negotiation loops.";
    case "semantic-kernel":
      return "Semantic Kernel fits tool-heavy enterprise orchestration pipelines.";
    default:
      return "Custom framework selected. Add strict contracts between agents.";
  }
};

export class GroupLlmService {
  constructor(
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>,
    private taskDAO: GenericDAO<Task>,
    private messageDAO: GenericDAO<Message>,
    private groupLlmConfigDAO: GenericDAO<GroupLlmConfig>,
    private coordinator: GroupLlmCoordinatorService = new GroupLlmCoordinatorService(),
  ) {}

  async getConfig(groupId: string, userId: string): Promise<GroupLlmConfigResponse> {
    await this.ensureMembership(groupId, userId);
    const config = await this.groupLlmConfigDAO.findOne({ groupId } as Partial<GroupLlmConfig>);
    return this.toConfigResponse(groupId, config);
  }

  async updateConfig(
    groupId: string,
    userId: string,
    input: UpdateGroupLlmConfigInput,
  ): Promise<GroupLlmConfigResponse> {
    const { role } = await this.ensureMembership(groupId, userId);
    if (!hasMinimumRole(role, "admin")) {
      throw new ForbiddenError("Nur Admins oder Owner koennen KI-Einstellungen aendern");
    }

    const current = await this.groupLlmConfigDAO.findOne({
      groupId,
    } as Partial<GroupLlmConfig>);

    const normalizedModel = input.model?.trim();
    if (input.model !== undefined && !normalizedModel) {
      throw new BadRequestError("Model darf nicht leer sein");
    }

    const nextDataAccess: GroupLlmDataAccess = {
      ...(current?.dataAccess || DEFAULT_GROUP_LLM_DATA_ACCESS),
      ...(input.dataAccess || {}),
    };

    const encryptedParts =
      input.apiKey !== undefined
        ? this.encryptApiKey(input.apiKey)
        : {
            apiKeyEncrypted: current?.apiKeyEncrypted,
            apiKeyIv: current?.apiKeyIv,
            apiKeyTag: current?.apiKeyTag,
          };

    const apiKeyHint =
      input.apiKey !== undefined ? maskApiKey(input.apiKey) : current?.apiKeyHint;

    if (!current) {
      const created = await this.groupLlmConfigDAO.create({
        groupId,
        enabled: input.enabled ?? false,
        provider: input.provider ?? DEFAULT_PROVIDER,
        model: normalizedModel ?? DEFAULT_MODEL,
        coordinationMode: input.coordinationMode ?? DEFAULT_COORDINATION_MODE,
        agentFramework: input.agentFramework ?? DEFAULT_AGENT_FRAMEWORK,
        dataAccess: nextDataAccess,
        ...(encryptedParts.apiKeyEncrypted && {
          apiKeyEncrypted: encryptedParts.apiKeyEncrypted,
          apiKeyIv: encryptedParts.apiKeyIv,
          apiKeyTag: encryptedParts.apiKeyTag,
        }),
        ...(apiKeyHint && { apiKeyHint }),
        updatedBy: userId,
      } as Omit<GroupLlmConfig, "id" | "createdAt" | "updatedAt">);

      return this.toConfigResponse(groupId, created);
    }

    const updated = await this.groupLlmConfigDAO.update({
      id: current.id,
      enabled: input.enabled ?? current.enabled,
      provider: input.provider ?? current.provider,
      model: normalizedModel ?? current.model,
      coordinationMode: input.coordinationMode ?? current.coordinationMode,
      agentFramework: input.agentFramework ?? current.agentFramework,
      dataAccess: nextDataAccess,
      ...(encryptedParts.apiKeyEncrypted && {
        apiKeyEncrypted: encryptedParts.apiKeyEncrypted,
        apiKeyIv: encryptedParts.apiKeyIv,
        apiKeyTag: encryptedParts.apiKeyTag,
      }),
      ...(apiKeyHint && { apiKeyHint }),
      updatedBy: userId,
    } as Partial<GroupLlmConfig>);

    if (!updated) {
      throw new InternalError("KI-Einstellungen konnten nicht gespeichert werden");
    }

    const refreshed = await this.groupLlmConfigDAO.findOne({
      id: current.id,
    } as Partial<GroupLlmConfig>);

    if (!refreshed) {
      throw new InternalError("KI-Einstellungen konnten nicht geladen werden");
    }

    return this.toConfigResponse(groupId, refreshed);
  }

  async coordinate(
    groupId: string,
    userId: string,
    input: CoordinateGroupLlmInput,
  ): Promise<GroupLlmCoordinationResponse> {
    const normalizedPrompt = input.prompt.trim();
    if (!normalizedPrompt) {
      throw new BadRequestError("Prompt darf nicht leer sein");
    }

    const { group, role } = await this.ensureMembership(groupId, userId);
    const llmConfig = await this.groupLlmConfigDAO.findOne({
      groupId,
    } as Partial<GroupLlmConfig>);

    if (!llmConfig || !llmConfig.enabled) {
      throw new BadRequestError("KI-Koordination ist fuer diese Gruppe nicht aktiviert");
    }

    if (!llmConfig.apiKeyEncrypted) {
      throw new BadRequestError("Kein API-Key fuer diese Gruppe hinterlegt");
    }

    const plan = this.coordinator.coordinate({
      groupId,
      userId,
      role,
      prompt: normalizedPrompt,
      intent: input.intent,
      idempotencyKey: input.idempotencyKey || randomUUID(),
    });

    const context = await this.buildContext(group, llmConfig.dataAccess);

    return {
      plan,
      runtime: {
        provider: llmConfig.provider,
        model: llmConfig.model,
        coordinationMode: llmConfig.coordinationMode,
        agentFramework: llmConfig.agentFramework,
        frameworkRecommendation: getFrameworkRecommendation(
          llmConfig.coordinationMode,
          llmConfig.agentFramework,
        ),
        hasApiKey: true,
      },
      context,
    };
  }

  private async buildContext(group: Group, access: GroupLlmDataAccess): Promise<GroupLlmCoordinationResponse["context"]> {
    const tasksPromise = access.includeTasks
      ? this.taskDAO.findAll({ groupId: group.id } as Partial<Task>)
      : Promise.resolve([]);
    const messagesPromise = access.includeMessages
      ? this.messageDAO.findAll({ groupId: group.id } as Partial<Message>)
      : Promise.resolve([]);
    const profilesPromise = access.includeMemberProfiles
      ? Promise.all(
          group.members.map((member) =>
            this.userDAO.findOne({ id: member.userId } as Partial<User>),
          ),
        )
      : Promise.resolve([]);

    const [tasks, messages, profiles] = await Promise.all([
      tasksPromise,
      messagesPromise,
      profilesPromise,
    ]);

    const tasksContext: GroupLlmContextTask[] = tasks
      .filter((task) => task.archived !== true)
      .slice(0, 40)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: toIso(task.dueDate),
      }));

    const usersById = new Map<string, User>(
      profiles.filter(isDefined).map((user) => [user.id, user]),
    );

    const messagesContext: GroupLlmContextMessage[] = messages
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30)
      .reverse()
      .map((message) => ({
        id: message.id,
        userId: message.userId,
        userName: usersById.get(message.userId)?.name || "Unbekannt",
        content: message.content,
        createdAt: toIso(message.createdAt),
      }));

    const memberProfiles: GroupLlmContextProfile[] = profiles
      .filter(isDefined)
      .map((user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        ...(user.bio && { bio: user.bio }),
        ...(user.avatar && { avatar: user.avatar }),
        achievements: user.achievements || [],
      }));

    return {
      group: {
        id: group.id,
        name: group.name,
        memberCount: group.members.length,
        activeResidentsCount: group.activeResidentsCount,
      },
      tasks: tasksContext,
      messages: messagesContext,
      memberProfiles,
    };
  }

  private toConfigResponse(
    groupId: string,
    configValue: GroupLlmConfig | null,
  ): GroupLlmConfigResponse {
    if (!configValue) {
      return {
        groupId,
        enabled: false,
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        coordinationMode: DEFAULT_COORDINATION_MODE,
        agentFramework: DEFAULT_AGENT_FRAMEWORK,
        dataAccess: { ...DEFAULT_GROUP_LLM_DATA_ACCESS },
        hasApiKey: false,
        updatedAt: null,
      };
    }

    return {
      groupId,
      enabled: configValue.enabled,
      provider: configValue.provider,
      model: configValue.model,
      coordinationMode: configValue.coordinationMode,
      agentFramework: configValue.agentFramework,
      dataAccess: configValue.dataAccess,
      hasApiKey: Boolean(configValue.apiKeyEncrypted),
      ...(configValue.apiKeyHint && { apiKeyHint: configValue.apiKeyHint }),
      ...(configValue.updatedBy && { updatedBy: configValue.updatedBy }),
      updatedAt: toIso(configValue.updatedAt),
    };
  }

  private async ensureMembership(
    groupId: string,
    userId: string,
  ): Promise<{ group: Group; role: GroupRole }> {
    const group = await this.groupDAO.findOne({ id: groupId } as Partial<Group>);
    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    const member = group.members.find((item) => item.userId === userId);
    if (!member) {
      throw new ForbiddenError("Kein Zugriff auf diese Gruppe");
    }

    return {
      group,
      role: member.role,
    };
  }

  private encryptApiKey(rawApiKey: string): {
    apiKeyEncrypted: string;
    apiKeyIv: string;
    apiKeyTag: string;
  } {
    const normalized = rawApiKey.trim();
    if (!normalized) {
      throw new BadRequestError("API-Key darf nicht leer sein");
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(normalized, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      apiKeyEncrypted: encrypted.toString("base64"),
      apiKeyIv: iv.toString("base64"),
      apiKeyTag: authTag.toString("base64"),
    };
  }

  private getEncryptionKey(): Buffer {
    const rawSecret =
      process.env["GROUP_LLM_ENCRYPTION_SECRET"] || config.jwt.accessSecret;
    return createHash("sha256").update(rawSecret).digest();
  }
}
