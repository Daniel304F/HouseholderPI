import { Entity } from "./entity.js";

export type GroupLlmProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "openrouter"
  | "custom";

export type GroupLlmCoordinationMode = "planner" | "multi_agent";

export type GroupLlmAgentFramework =
  | "langgraph"
  | "autogen"
  | "semantic-kernel"
  | "custom";

export interface GroupLlmDataAccess {
  includeTasks: boolean;
  includeMessages: boolean;
  includeMemberProfiles: boolean;
}

export interface GroupLlmConfig extends Entity {
  groupId: string;
  enabled: boolean;
  provider: GroupLlmProvider;
  model: string;
  coordinationMode: GroupLlmCoordinationMode;
  agentFramework: GroupLlmAgentFramework;
  dataAccess: GroupLlmDataAccess;
  apiKeyEncrypted?: string;
  apiKeyIv?: string;
  apiKeyTag?: string;
  apiKeyHint?: string;
  updatedBy: string;
}

export interface GroupLlmConfigResponse {
  groupId: string;
  enabled: boolean;
  provider: GroupLlmProvider;
  model: string;
  coordinationMode: GroupLlmCoordinationMode;
  agentFramework: GroupLlmAgentFramework;
  dataAccess: GroupLlmDataAccess;
  hasApiKey: boolean;
  apiKeyHint?: string;
  updatedBy?: string;
  updatedAt: string | null;
}

export const DEFAULT_GROUP_LLM_DATA_ACCESS: GroupLlmDataAccess = {
  includeTasks: true,
  includeMessages: true,
  includeMemberProfiles: true,
};
