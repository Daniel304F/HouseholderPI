import test from "node:test";
import assert from "node:assert/strict";
import { StatisticsService } from "../src/services/statistics.service.js";
import type { GenericDAO } from "../src/models/generic.dao.js";
import type { Task } from "../src/models/task.js";
import type { Group } from "../src/models/group.js";
import type { User } from "../src/models/user.js";

type MockTaskDAO = Pick<GenericDAO<Task>, "findAll">;
type MockGroupDAO = Pick<GenericDAO<Group>, "findOne" | "findAll">;
type MockUserDAO = Pick<GenericDAO<User>, "findOne" | "update">;

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
  ],
  activeResidentsCount: 1,
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

const createTask = (index: number): Task => ({
  id: `task-${index}`,
  groupId: "group-1",
  title: `Task ${index}`,
  status: "completed",
  priority: "medium",
  assignedTo: "user-1",
  dueDate: new Date("2026-01-01T00:00:00.000Z"),
  createdBy: "user-1",
  parentTaskId: null,
  linkedTasks: [],
  notes: undefined,
  attachments: [],
  completionProof: null,
  completedAt: new Date("2026-01-01T01:00:00.000Z"),
  completedBy: "user-1",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

test("getGroupStatistics persists achievement ids for members", async () => {
  const updates: Array<Partial<User>> = [];

  const taskDAO: MockTaskDAO = {
    findAll: async () => Array.from({ length: 12 }, (_, i) => createTask(i + 1)),
  };

  const groupDAO: MockGroupDAO = {
    findOne: async () => createGroup(),
    findAll: async () => [],
  };

  const userDAO: MockUserDAO = {
    findOne: async (filter) => ({
      id: filter.id || "user-1",
      email: "test@example.com",
      name: "Danie",
      password: "hashed",
      achievements: [],
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    }),
    update: async (payload) => {
      updates.push(payload);
      return true;
    },
  };

  const service = new StatisticsService(
    taskDAO as unknown as GenericDAO<Task>,
    groupDAO as unknown as GenericDAO<Group>,
    userDAO as unknown as GenericDAO<User>,
  );

  const stats = await service.getGroupStatistics("group-1", "user-1");
  const topMember = stats.memberStats[0] as unknown as {
    achievementIds?: string[];
    score?: number;
  };

  assert.ok(topMember);
  assert.ok(Array.isArray(topMember.achievementIds));
  assert.ok(topMember.achievementIds?.includes("starter"));
  assert.ok(typeof topMember.score === "number");

  assert.ok(updates.length > 0);
  assert.ok(Array.isArray((updates[0] as { achievements?: string[] }).achievements));
});
