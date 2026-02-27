import test from "node:test";
import assert from "node:assert/strict";
import type { GenericDAO } from "../src/models/generic.dao.js";
import type { Group } from "../src/models/group.js";
import type { User } from "../src/models/user.js";
import type { Task } from "../src/models/task.js";
import type { Message } from "../src/models/message.js";
import type { GroupLlmConfig } from "../src/models/groupLlmConfig.js";
import { GroupLlmService } from "../src/services/group-llm.service.js";
import { BadRequestError, ForbiddenError } from "../src/services/errors.js";

type GroupDao = Pick<GenericDAO<Group>, "findOne">;
type UserDao = Pick<GenericDAO<User>, "findOne">;
type TaskDao = Pick<GenericDAO<Task>, "findAll">;
type MessageDao = Pick<GenericDAO<Message>, "findAll">;
type GroupLlmConfigDao = Pick<GenericDAO<GroupLlmConfig>, "findOne" | "create" | "update">;

const createGroup = (role: "owner" | "admin" | "member" = "owner"): Group => ({
  id: "group-1",
  name: "Haus Crew",
  inviteCode: "INVITE01",
  members: [
    {
      userId: "user-1",
      role,
      isActiveResident: true,
      joinedAt: new Date("2026-02-01T00:00:00.000Z"),
    },
    {
      userId: "user-2",
      role: "member",
      isActiveResident: true,
      joinedAt: new Date("2026-02-01T00:00:00.000Z"),
    },
  ],
  activeResidentsCount: 2,
  permissions: {
    createTask: "member",
    assignTask: "member",
    deleteTask: "admin",
    editTask: "member",
    manageRecurringTasks: "admin",
  },
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
});

const createUser = (id: string, name: string): User => ({
  id,
  name,
  email: `${id}@example.com`,
  password: "hashed",
  bio: id === "user-1" ? "Ich organisiere die WG." : "Ich uebernehme den Muell.",
  avatar: "",
  achievements: ["starter"],
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
});

const createConfig = (overrides: Partial<GroupLlmConfig> = {}): GroupLlmConfig => ({
  id: "cfg-1",
  groupId: "group-1",
  enabled: true,
  provider: "openai",
  model: "gpt-4o-mini",
  coordinationMode: "multi_agent",
  agentFramework: "langgraph",
  dataAccess: {
    includeTasks: true,
    includeMessages: true,
    includeMemberProfiles: true,
  },
  apiKeyEncrypted: "ciphertext",
  apiKeyIv: "iv",
  apiKeyTag: "tag",
  apiKeyHint: "****-KEY1",
  updatedBy: "user-1",
  createdAt: new Date("2026-02-10T00:00:00.000Z"),
  updatedAt: new Date("2026-02-10T00:00:00.000Z"),
  ...overrides,
});

const createTask = (): Task => ({
  id: "task-1",
  groupId: "group-1",
  title: "Kueche putzen",
  status: "pending",
  priority: "medium",
  assignedTo: "user-2",
  dueDate: new Date("2026-02-12T00:00:00.000Z"),
  createdBy: "user-1",
  parentTaskId: null,
  linkedTasks: [],
  attachments: [],
  completionProof: null,
  completedAt: null,
  completedBy: null,
  createdAt: new Date("2026-02-10T00:00:00.000Z"),
  updatedAt: new Date("2026-02-10T00:00:00.000Z"),
});

const createMessage = (): Message => ({
  id: "msg-1",
  groupId: "group-1",
  userId: "user-2",
  content: "Ich mache den Muell heute Abend.",
  editedAt: null,
  attachments: [],
  reactions: [],
  createdAt: new Date("2026-02-10T08:00:00.000Z"),
  updatedAt: new Date("2026-02-10T08:00:00.000Z"),
});

const createService = ({
  groupRole = "owner",
  config = createConfig(),
}: {
  groupRole?: "owner" | "admin" | "member";
  config?: GroupLlmConfig | null;
} = {}) => {
  const createdConfigs: GroupLlmConfig[] = [];

  const groupDAO: GroupDao = {
    findOne: async () => createGroup(groupRole),
  };

  const userDAO: UserDao = {
    findOne: async (filter) => {
      if (filter.id === "user-1") return createUser("user-1", "Danie");
      if (filter.id === "user-2") return createUser("user-2", "Mia");
      return null;
    },
  };

  const taskDAO: TaskDao = {
    findAll: async () => [createTask()],
  };

  const messageDAO: MessageDao = {
    findAll: async () => [createMessage()],
  };

  const configDAO: GroupLlmConfigDao = {
    findOne: async () => config,
    create: async (payload) => {
      const created = createConfig({
        id: "cfg-created",
        ...payload,
      });
      createdConfigs.push(created);
      return created;
    },
    update: async () => true,
  };

  const service = new GroupLlmService(
    groupDAO as unknown as GenericDAO<Group>,
    userDAO as unknown as GenericDAO<User>,
    taskDAO as unknown as GenericDAO<Task>,
    messageDAO as unknown as GenericDAO<Message>,
    configDAO as unknown as GenericDAO<GroupLlmConfig>,
  );

  return {
    service,
    createdConfigs,
  };
};

test("updateConfig persists encrypted key and returns masked key hint", async () => {
  const { service, createdConfigs } = createService({ config: null });

  const response = await service.updateConfig("group-1", "user-1", {
    enabled: true,
    provider: "openai",
    model: "gpt-4.1-mini",
    apiKey: "sk-test-super-secret-key",
    coordinationMode: "multi_agent",
    agentFramework: "langgraph",
    dataAccess: { includeMemberProfiles: true },
  });

  assert.equal(response.enabled, true);
  assert.equal(response.hasApiKey, true);
  assert.match(response.apiKeyHint || "", /^\*{4}-.{4}$/);

  const persistedConfig = createdConfigs[0];
  assert.ok(persistedConfig);
  assert.notEqual(persistedConfig?.apiKeyEncrypted, "sk-test-super-secret-key");
});

test("updateConfig denies members from changing group llm settings", async () => {
  const { service } = createService({ groupRole: "member" });

  await assert.rejects(
    () =>
      service.updateConfig("group-1", "user-1", {
        model: "gpt-4.1-mini",
      }),
    ForbiddenError,
  );
});

test("coordinate returns group context including tasks, messages and member profiles", async () => {
  const { service } = createService();

  const result = await service.coordinate("group-1", "user-1", {
    prompt: "Bitte schlage einen fairen Wochenplan vor.",
    intent: "task_creation",
    idempotencyKey: "run-group-1",
  });

  assert.equal(result.plan.intent, "task_creation");
  assert.equal(result.runtime.agentFramework, "langgraph");
  assert.equal(result.context.tasks.length, 1);
  assert.equal(result.context.messages.length, 1);
  assert.equal(result.context.memberProfiles.length, 2);
});

test("coordinate fails if no api key is configured", async () => {
  const configWithoutApiKey = createConfig();
  delete configWithoutApiKey.apiKeyEncrypted;
  delete configWithoutApiKey.apiKeyIv;
  delete configWithoutApiKey.apiKeyTag;
  delete configWithoutApiKey.apiKeyHint;

  const { service } = createService({
    config: configWithoutApiKey,
  });

  await assert.rejects(
    () =>
      service.coordinate("group-1", "user-1", {
        prompt: "Erstelle eine Zusammenfassung.",
        intent: "chat_summary",
        idempotencyKey: "no-key-run",
      }),
    BadRequestError,
  );
});
