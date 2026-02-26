import test from "node:test";
import assert from "node:assert/strict";
import { MessageService } from "../src/services/message.service.js";
import { BadRequestError } from "../src/services/errors.js";
import type { GenericDAO } from "../src/models/generic.dao.js";
import type { Message } from "../src/models/message.js";
import type { Group } from "../src/models/group.js";
import type { User } from "../src/models/user.js";

type MockMessageDAO = Pick<GenericDAO<Message>, "create" | "findAll" | "findOne" | "update">;
type MockGroupDAO = Pick<GenericDAO<Group>, "findOne">;
type MockUserDAO = Pick<GenericDAO<User>, "findOne">;

const createGroup = (): Group => ({
  id: "group-1",
  name: "WG",
  inviteCode: "INVITE",
  members: [
    {
      userId: "user-1",
      role: "owner",
      isActiveResident: true,
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
    {
      userId: "user-2",
      role: "member",
      isActiveResident: true,
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
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
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

const createMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "message-1",
  groupId: "group-1",
  userId: "user-1",
  content: "Hallo",
  editedAt: null,
  attachments: [],
  reactions: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

const createUser = (id: string, name: string): User => ({
  id,
  email: `${id}@example.com`,
  name,
  password: "hashed",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

test("createMessage allows image attachment without text", async () => {
  let messageState = createMessage({ content: "", attachments: [] });

  const messageDAO: MockMessageDAO = {
    create: async (payload) => {
      messageState = createMessage({
        id: "message-2",
        content: payload.content,
        attachments: payload.attachments as Message["attachments"],
      });
      return messageState;
    },
    findAll: async () => [messageState],
    findOne: async () => messageState,
    update: async () => true,
  };

  const service = new MessageService(
    messageDAO as unknown as GenericDAO<Message>,
    { findOne: async () => createGroup() } as unknown as GenericDAO<Group>,
    {
      findOne: async (filter) =>
        createUser(filter.id || "user-1", filter.id === "user-2" ? "Mia" : "Danie"),
    } as unknown as GenericDAO<User>,
  );

  const response = await (service as unknown as {
    createMessage: (
      groupId: string,
      userId: string,
      content: string,
      attachments: Array<{
        id: string;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
      }>,
    ) => Promise<{ attachments?: unknown[] }>;
  }).createMessage("group-1", "user-1", "", [
    {
      id: "att-1",
      filename: "img-1.jpg",
      originalName: "wohnzimmer.jpg",
      mimeType: "image/jpeg",
      size: 1234,
    },
  ]);

  assert.equal(response.attachments?.length, 1);
});

test("createMessage rejects fully empty payload", async () => {
  const service = new MessageService(
    {
      create: async () => createMessage(),
      findAll: async () => [],
      findOne: async () => null,
      update: async () => true,
    } as unknown as GenericDAO<Message>,
    { findOne: async () => createGroup() } as unknown as GenericDAO<Group>,
    {
      findOne: async () => createUser("user-1", "Danie"),
    } as unknown as GenericDAO<User>,
  );

  await assert.rejects(
    () =>
      (service as unknown as {
        createMessage: (
          groupId: string,
          userId: string,
          content: string,
          attachments?: unknown[],
        ) => Promise<unknown>;
      }).createMessage("group-1", "user-1", "   ", []),
    BadRequestError,
  );
});

test("addReaction stores user reaction and returns updated message", async () => {
  let messageState = createMessage({
    reactions: [],
  });

  const service = new MessageService(
    {
      create: async () => messageState,
      findAll: async () => [messageState],
      findOne: async (filter) => {
        if (filter.id === "message-1") return messageState;
        return null;
      },
      update: async (payload) => {
        messageState = createMessage({
          ...messageState,
          reactions: payload.reactions as Message["reactions"],
        });
        return true;
      },
    } as unknown as GenericDAO<Message>,
    { findOne: async () => createGroup() } as unknown as GenericDAO<Group>,
    {
      findOne: async (filter) =>
        createUser(filter.id || "user-1", filter.id === "user-2" ? "Mia" : "Danie"),
    } as unknown as GenericDAO<User>,
  );

  const updated = await (service as unknown as {
    addReaction: (
      groupId: string,
      messageId: string,
      userId: string,
      emoji: string,
    ) => Promise<{ reactions?: Array<{ emoji: string; userIds: string[] }> }>;
  }).addReaction("group-1", "message-1", "user-2", "👍");

  assert.equal(updated.reactions?.length, 1);
  assert.equal(updated.reactions?.[0]?.emoji, "👍");
  assert.ok(updated.reactions?.[0]?.userIds.includes("user-2"));
});
