import test from "node:test";
import assert from "node:assert/strict";
import { FriendService } from "../src/services/friend.service.js";
import { ForbiddenError, NotFoundError } from "../src/services/errors.js";
import type { GenericDAO } from "../src/models/generic.dao.js";
import type { Friendship } from "../src/models/friend.js";
import type { User } from "../src/models/user.js";
import type { DirectMessage } from "../src/models/directMessage.js";

type MockFriendshipDAO = Pick<GenericDAO<Friendship>, "findAll" | "findOne" | "create" | "update" | "delete">;
type MockUserDAO = Pick<GenericDAO<User>, "findOne">;
type MockDirectMessageDAO = Pick<GenericDAO<DirectMessage>, "findAll" | "findOne" | "create">;

const createFriendship = (overrides: Partial<Friendship> = {}): Friendship => ({
  id: "friendship-1",
  requesterId: "user-1",
  addresseeId: "user-2",
  status: "accepted",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

const createUser = (id: string, name: string): User => ({
  id,
  email: `${id}@example.com`,
  name,
  password: "hashed",
  bio: id === "user-2" ? "Ich bin Mia" : "Ich bin Danie",
  avatar: "",
  achievements: ["starter"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

const createDirectMessage = (
  overrides: Partial<DirectMessage> = {},
): DirectMessage => ({
  id: "dm-1",
  senderId: "user-1",
  recipientId: "user-2",
  content: "Hallo",
  attachments: [],
  readAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

const createService = ({
  friendships = [createFriendship()],
  messages = [],
}: {
  friendships?: Friendship[];
  messages?: DirectMessage[];
} = {}) => {
  const friendshipDAO: MockFriendshipDAO = {
    findAll: async () => friendships,
    findOne: async () => null,
    create: async () => createFriendship(),
    update: async () => true,
    delete: async () => true,
  };

  const userDAO: MockUserDAO = {
    findOne: async (filter) => {
      if (!filter.id) return null;
      if (filter.id === "user-1") return createUser("user-1", "Danie");
      if (filter.id === "user-2") return createUser("user-2", "Mia");
      return null;
    },
  };

  const directMessageDAO: MockDirectMessageDAO = {
    findAll: async () => messages,
    findOne: async () => null,
    create: async (payload) =>
      createDirectMessage({
        id: "dm-created",
        senderId: payload.senderId,
        recipientId: payload.recipientId,
        content: payload.content,
        attachments: payload.attachments as DirectMessage["attachments"],
      }),
  };

  return new FriendService(
    friendshipDAO as unknown as GenericDAO<Friendship>,
    userDAO as unknown as GenericDAO<User>,
    directMessageDAO as unknown as GenericDAO<DirectMessage>,
  );
};

test("getFriendProfile returns public profile for accepted friendship", async () => {
  const service = createService();
  const profile = await service.getFriendProfile("user-1", "user-2");

  assert.equal(profile.id, "user-2");
  assert.equal(profile.name, "Mia");
  assert.equal(profile.bio, "Ich bin Mia");
  assert.equal(profile.friendSince, "2026-01-01T00:00:00.000Z");
});

test("getFriendProfile throws for non-friends", async () => {
  const service = createService({ friendships: [] });
  await assert.rejects(
    () => service.getFriendProfile("user-1", "user-2"),
    ForbiddenError,
  );
});

test("sendDirectMessage allows image-only messages for friends", async () => {
  const service = createService();
  const result = await service.sendDirectMessage("user-1", "user-2", "", [
    {
      id: "att-1",
      filename: "photo.jpg",
      originalName: "photo.jpg",
      mimeType: "image/jpeg",
      size: 1024,
    },
  ]);

  assert.equal(result.id, "dm-created");
  assert.equal(result.attachments.length, 1);
  assert.equal(result.attachments[0]?.url, "/uploads/photo.jpg");
});

test("sendDirectMessage rejects if recipient user does not exist", async () => {
  const service = createService();
  await assert.rejects(
    () => service.sendDirectMessage("user-1", "user-404", "Hi"),
    NotFoundError,
  );
});
