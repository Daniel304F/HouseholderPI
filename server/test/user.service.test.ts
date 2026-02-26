import test from "node:test";
import assert from "node:assert/strict";
import { UserService } from "../src/services/user.service.js";
import type { User } from "../src/models/user.js";
import type { GenericDAO } from "../src/models/generic.dao.js";

type MockUserDAO = Pick<GenericDAO<User>, "findOne" | "update">;

const createUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  password: "hashed-password",
  avatar: "",
  bio: "alte bio",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

test("updateProfile persists bio and returns it in response", async () => {
  let findOneCall = 0;
  let capturedUpdatePayload: unknown;

  const userDAO: MockUserDAO = {
    findOne: async () => {
      findOneCall += 1;
      return findOneCall === 1
        ? createUser({ bio: "alte bio" })
        : createUser({ bio: "neue bio" });
    },
    update: async (payload) => {
      capturedUpdatePayload = payload;
      return true;
    },
  };

  const service = new UserService(userDAO as unknown as GenericDAO<User>);

  const result = await service.updateProfile("user-1", {
    bio: "neue bio",
  });

  assert.equal((capturedUpdatePayload as { bio?: string }).bio, "neue bio");
  assert.equal(result.bio, "neue bio");
});
