import test from "node:test";
import assert from "node:assert/strict";
import { TaskService } from "../src/services/task.service.js";
import {
  BadRequestError,
  InternalError,
  NotFoundError,
} from "../src/services/errors.js";
import type { GenericDAO } from "../src/models/generic.dao.js";
import type { Task } from "../src/models/task.js";
import type { Group } from "../src/models/group.js";
import type { User } from "../src/models/user.js";

type MockTaskDAO = Pick<GenericDAO<Task>, "findOne" | "update" | "create">;
type MockGroupDAO = Pick<GenericDAO<Group>, "findOne">;
type MockUserDAO = Pick<GenericDAO<User>, "findOne">;

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  groupId: "group-1",
  title: "Archived task",
  status: "completed",
  priority: "medium",
  assignedTo: null,
  dueDate: new Date("2026-01-01T00:00:00.000Z"),
  createdBy: "user-1",
  parentTaskId: null,
  linkedTasks: [],
  notes: undefined,
  attachments: [],
  completionProof: null,
  completedAt: new Date("2026-01-01T01:00:00.000Z"),
  completedBy: "user-1",
  archived: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

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

const createService = (
  taskDAOOverrides: Partial<MockTaskDAO> = {},
  groupDAOOverrides: Partial<MockGroupDAO> = {},
) => {
  const taskDAO: MockTaskDAO = {
    create: async () => createTask(),
    findOne: async () => null,
    update: async () => false,
    ...taskDAOOverrides,
  };

  const groupDAO: MockGroupDAO = {
    findOne: async () => createGroup(),
    ...groupDAOOverrides,
  };

  const userDAO: MockUserDAO = {
    findOne: async () => null,
  };

  return new TaskService(
    taskDAO as unknown as GenericDAO<Task>,
    groupDAO as unknown as GenericDAO<Group>,
    userDAO as unknown as GenericDAO<User>,
  );
};

test("restoreArchivedTask restores an archived task", async () => {
  const archivedTask = createTask({ archived: true });
  const restoredTask = createTask({ archived: false });

  const service = createService({
    findOne: async (filter) => {
      if (filter.id === "task-1" && filter.groupId === "group-1") {
        return archivedTask;
      }
      if (filter.id === "task-1") {
        return restoredTask;
      }
      return null;
    },
    update: async () => true,
  });

  const result = await service.restoreArchivedTask("group-1", "task-1", "user-1");
  assert.equal(result.id, "task-1");
  assert.equal(result.archived, undefined);
});

test("restoreArchivedTask throws if task is not archived", async () => {
  const service = createService({
    findOne: async () => createTask({ archived: false }),
  });

  await assert.rejects(
    () => service.restoreArchivedTask("group-1", "task-1", "user-1"),
    BadRequestError,
  );
});

test("restoreArchivedTask throws if task does not exist", async () => {
  const service = createService({
    findOne: async () => null,
  });

  await assert.rejects(
    () => service.restoreArchivedTask("group-1", "task-1", "user-1"),
    NotFoundError,
  );
});

test("restoreArchivedTask throws if update fails", async () => {
  const service = createService({
    findOne: async () => createTask({ archived: true }),
    update: async () => false,
  });

  await assert.rejects(
    () => service.restoreArchivedTask("group-1", "task-1", "user-1"),
    InternalError,
  );
});

test("createTask persists notes in task entity", async () => {
  let capturedCreatePayload: unknown;

  const service = createService({
    create: async (payload) => {
      capturedCreatePayload = payload;
      return createTask({
        id: "task-create-1",
        title: payload.title,
        notes: payload.notes,
        groupId: payload.groupId,
        status: payload.status,
        priority: payload.priority,
        assignedTo: payload.assignedTo,
        dueDate: payload.dueDate as Date,
        createdBy: payload.createdBy,
        parentTaskId: payload.parentTaskId,
        linkedTasks: payload.linkedTasks as Task["linkedTasks"],
        attachments: payload.attachments as Task["attachments"],
        completionProof: payload.completionProof as Task["completionProof"],
        completedAt: payload.completedAt as Task["completedAt"],
        completedBy: payload.completedBy,
      });
    },
  });

  const result = await service.createTask("group-1", "user-1", {
    title: "Badezimmer putzen",
    dueDate: "2026-02-01T00:00:00.000Z",
    notes: "Bitte Spiegel und Waschbecken zuerst",
  });

  assert.ok(capturedCreatePayload);
  assert.equal(
    (capturedCreatePayload as { notes?: string }).notes,
    "Bitte Spiegel und Waschbecken zuerst",
  );
  assert.equal(result.notes, "Bitte Spiegel und Waschbecken zuerst");
});

test("updateTask writes notes into update payload", async () => {
  let capturedUpdatePayload: unknown;
  const existingTask = createTask({ notes: "alt" });
  const updatedTask = createTask({ notes: "neu" });

  const service = createService({
    findOne: async (filter) => {
      if (filter.id === "task-1" && filter.groupId === "group-1") {
        return existingTask;
      }
      if (filter.id === "task-1") {
        return updatedTask;
      }
      return null;
    },
    update: async (payload) => {
      capturedUpdatePayload = payload;
      return true;
    },
  });

  const result = await service.updateTask("group-1", "task-1", "user-1", {
    notes: "neu",
  });

  assert.ok(capturedUpdatePayload);
  assert.equal((capturedUpdatePayload as { notes?: string }).notes, "neu");
  assert.equal(result.notes, "neu");
});
