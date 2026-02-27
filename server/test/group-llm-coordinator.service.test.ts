import test from "node:test";
import assert from "node:assert/strict";
import {
  GroupLlmCoordinatorService,
  GroupLlmRequest,
} from "../src/services/group-llm-coordinator.service.js";
import { ForbiddenError } from "../src/services/errors.js";

const createRequest = (
  overrides: Partial<GroupLlmRequest> = {},
): GroupLlmRequest => ({
  groupId: "group-1",
  userId: "user-1",
  role: "member",
  prompt: "Bitte fasse den Chat kurz zusammen.",
  intent: "chat_summary",
  idempotencyKey: "run-1",
  ...overrides,
});

test("coordinate builds a read-only plan for chat summary", () => {
  const service = new GroupLlmCoordinatorService();

  const result = service.coordinate(createRequest());

  assert.equal(result.intent, "chat_summary");
  assert.equal(result.mode, "read");
  assert.equal(result.canExecuteTools, false);
  assert.deepEqual(result.toolScopes, []);
  assert.deepEqual(result.agents, ["planner", "summary-agent", "reviewer"]);
});

test("coordinate returns the same run for the same idempotency key", () => {
  const service = new GroupLlmCoordinatorService();
  const request = createRequest({ idempotencyKey: "stable-key" });

  const first = service.coordinate(request);
  const second = service.coordinate(request);

  assert.equal(first.runId, second.runId);
  assert.deepEqual(first, second);
});

test("coordinate blocks moderation workflows for member role", () => {
  const service = new GroupLlmCoordinatorService();

  assert.throws(
    () =>
      service.coordinate(
        createRequest({
          intent: "moderation",
          prompt: "Markiere toxische Nachrichten und setze ein Warnflag.",
        }),
      ),
    ForbiddenError,
  );
});

test("coordinate allows moderation workflows for admin role", () => {
  const service = new GroupLlmCoordinatorService();

  const result = service.coordinate(
    createRequest({
      role: "admin",
      intent: "moderation",
      prompt: "Moderiere den Chat und markiere Verstöße.",
    }),
  );

  assert.equal(result.mode, "write");
  assert.equal(result.canExecuteTools, true);
  assert.deepEqual(result.toolScopes, ["group.moderate"]);
  assert.deepEqual(result.agents, ["planner", "moderation-agent", "reviewer"]);
});

test("coordinate exposes task tool scopes for task creation intent", () => {
  const service = new GroupLlmCoordinatorService();

  const result = service.coordinate(
    createRequest({
      intent: "task_creation",
      prompt: "Erzeuge Aufgaben aus den letzten Nachrichten.",
    }),
  );

  assert.equal(result.mode, "write");
  assert.equal(result.canExecuteTools, true);
  assert.deepEqual(result.toolScopes, ["task.create", "task.assign.suggest"]);
  assert.deepEqual(result.agents, ["planner", "task-agent", "reviewer"]);
});
