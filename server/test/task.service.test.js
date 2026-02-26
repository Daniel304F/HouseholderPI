import test from "node:test";
import assert from "node:assert/strict";
import { TaskService } from "../src/services/task.service.js";
import { BadRequestError, InternalError, NotFoundError, } from "../src/services/errors.js";
const createTask = (overrides = {}) => ({
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
    attachments: [],
    completionProof: null,
    completedAt: new Date("2026-01-01T01:00:00.000Z"),
    completedBy: "user-1",
    archived: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
});
const createGroup = () => ({
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
const createService = (taskDAOOverrides = {}, groupDAOOverrides = {}) => {
    const taskDAO = {
        findOne: async () => null,
        update: async () => false,
        ...taskDAOOverrides,
    };
    const groupDAO = {
        findOne: async () => createGroup(),
        ...groupDAOOverrides,
    };
    const userDAO = {
        findOne: async () => null,
    };
    return new TaskService(taskDAO, groupDAO, userDAO);
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
    await assert.rejects(() => service.restoreArchivedTask("group-1", "task-1", "user-1"), BadRequestError);
});
test("restoreArchivedTask throws if task does not exist", async () => {
    const service = createService({
        findOne: async () => null,
    });
    await assert.rejects(() => service.restoreArchivedTask("group-1", "task-1", "user-1"), NotFoundError);
});
test("restoreArchivedTask throws if update fails", async () => {
    const service = createService({
        findOne: async () => createTask({ archived: true }),
        update: async () => false,
    });
    await assert.rejects(() => service.restoreArchivedTask("group-1", "task-1", "user-1"), InternalError);
});
//# sourceMappingURL=task.service.test.js.map