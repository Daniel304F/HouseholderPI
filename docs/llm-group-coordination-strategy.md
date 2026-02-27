# LLM Group Coordination Strategy

## Goal
Provide a production-ready coordination model for LLM actions inside a household group:
- safe actions by role and policy
- deterministic execution for retries and mobile reconnects
- scalable architecture for future features (task extraction, moderation, summaries, calendar export)

## Design Principles
1. Keep LLMs stateless; persist all run state in backend stores.
2. Treat every LLM call as a workflow run with idempotency.
3. Separate orchestration from domain writes (task/group/calendar/chat).
4. Prefer event-driven side effects for reliability and observability.

## Core Patterns (Large App)
1. Orchestrator Pattern
- Central coordinator receives one request and builds an execution plan.
- Current base implementation: [server/src/services/group-llm-coordinator.service.ts](/d:/Projekte/HouseholderPI/server/src/services/group-llm-coordinator.service.ts)

2. Strategy Pattern (Intent -> Workflow)
- Each intent maps to a dedicated strategy:
- `chat_summary`: read-only
- `task_creation`: write with task scopes
- `calendar_export`: write with calendar scope
- `moderation`: write, admin+ only

3. Policy Engine / Authorization Gate
- Role-based guard before any model/tool call.
- Scope-based checks per tool operation (`task.create`, `group.moderate`, ...).
- Enforce group membership and role snapshot at run start.

4. Idempotency + Run Store
- Use `idempotencyKey` to deduplicate retries from client or worker.
- Persist run decision + status (`queued`, `running`, `succeeded`, `failed`).
- Return the same run result for the same key.

5. Saga / Process Manager
- Multi-step workflows (plan -> tool -> validate -> commit) use explicit step state.
- On failure, publish compensation events (for example rollback draft tasks).

6. Outbox Pattern
- Domain updates emit events into an outbox in the same transaction boundary.
- Async workers publish to Socket.IO, notifications, and analytics.
- Prevent partial writes where DB commit succeeds but event delivery fails.

7. Command Bus for Tool Calls
- LLM does not call repositories directly.
- It emits typed commands:
- `CreateTaskCommand`
- `ExportCalendarEventCommand`
- `FlagMessageCommand`
- Command handlers own validation and domain invariants.

8. Observability Pattern
- Correlation IDs per run and per command.
- Structured logs with: `runId`, `groupId`, `intent`, `agent`, `latencyMs`, `tokenUsage`.
- Metrics: success rate, fallback rate, tool error rate, median latency, P95 latency.

## Suggested Service Boundaries
1. `GroupLlmCoordinatorService`
- Input validation, policy checks, workflow selection, idempotency.

2. `GroupLlmRuntimeService`
- Executes plan steps and invokes model providers.

3. `GroupLlmCommandHandlers`
- Safe domain mutations through command handlers.

4. `GroupLlmRunRepository`
- Persistent run snapshots and step results.

5. `GroupLlmEventPublisher`
- Writes outbox records and emits real-time updates.

## Data Model (Minimal)
1. `llmRuns`
- `id`, `groupId`, `userId`, `intent`, `status`, `idempotencyKey`, `createdAt`, `updatedAt`

2. `llmRunSteps`
- `runId`, `step`, `agent`, `status`, `inputHash`, `outputRef`, `error`

3. `llmOutbox`
- `eventId`, `runId`, `eventType`, `payload`, `publishedAt`

4. `groupLlmMemory`
- compact, privacy-filtered summaries per group and channel scope

## Request Lifecycle
1. Client sends request with intent + `idempotencyKey`.
2. Coordinator loads membership/role and validates policy.
3. Coordinator returns or creates execution plan.
4. Runtime executes agents by workflow steps.
5. Commands are validated and committed by domain handlers.
6. Outbox events are published to Socket.IO and notifications.
7. Final run result is persisted and returned.

## Security and Privacy Controls
1. Never include private direct-message content in group context.
2. Redact PII from prompts and logs where possible.
3. Keep a model allowlist per intent.
4. Add human-review mode for high-impact intents (moderation and permission changes).

## Rollout Plan
1. Phase 1 (now)
- Keep `GroupLlmCoordinatorService` pure and deterministic.
- Add tests for intents, role checks, and idempotency.

2. Phase 2
- Persist runs in DB and move in-memory idempotency to repository-backed storage.
- Add outbox and worker-based event publishing.

3. Phase 3
- Introduce command handlers for task/calendar/moderation mutations.
- Add per-group prompt templates and memory compression.

4. Phase 4
- Add multi-provider routing, cost governance, and SLA dashboards.
