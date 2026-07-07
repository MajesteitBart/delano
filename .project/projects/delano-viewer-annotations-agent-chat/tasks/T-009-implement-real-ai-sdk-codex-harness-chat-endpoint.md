---
id: T-009
name: Implement local Codex CLI subscription-auth chat endpoint
status: done
workstream: WS-D
created: 2026-06-30T22:20:50Z
updated: 2026-06-30T23:37:39Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-008]
conflicts_with: []
parallel: true
priority: high
estimate: L
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Implement local Codex CLI subscription-auth chat endpoint

## Description

Replace the optional dynamic stub with a tested AI SDK 7 UI message stream endpoint backed by the local Codex CLI when available. The endpoint streams assistant output for selected annotation attachments through the user's existing Codex CLI subscription auth while keeping file writes behind reviewed apply endpoints.

## Acceptance Criteria

- [x] The server uses AI SDK 7 UI message stream output and a local `codex exec --json` backend instead of unresolved dynamic imports or AI SDK v6 provider packages.
- [x] Chat requests include active document path, selected annotations, and context profile guidance without unbounded prompt stuffing.
- [x] Tests cover fallback stream when Codex is unavailable, fake local Codex CLI JSON streaming, invalid payloads, and no direct file-write behavior. Live Codex uses the user's local Codex CLI login by default when `codex` is available on `PATH`.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- The current server has a `streamWithCodexCli` path that runs `codex exec --json --sandbox read-only` when `codex` is available on `PATH`, with command/model overrides reserved for advanced local use and tests.
- The user clarified that T-009 should primarily use subscription auth from Codex. The documented `ai-sdk-provider-codex-cli` package is an AI SDK v6 provider, while this repo uses `ai@7.0.9`; the compatible path is to keep AI SDK 7 for the response stream and bridge local Codex CLI JSON events server-side.
- The implementation should keep the fallback path deterministic for offline/local use.
- The endpoint should stream one stable event contract to the viewer so UI behavior is independent of whether the active backend is Codex or fallback.
- Chat may propose edits, but must not call the reviewed apply endpoint automatically.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T23:37:39Z: Implemented local Codex CLI subscription-auth backend behind AI SDK 7 UI message stream; focused server tests and live read-only Codex CLI smoke passed; pi -p second-opinion review found no blocking bugs.

- 2026-07-01T01:24:39+02:00: Folded user correction into T-009: subscription auth should come from the local Codex CLI. Verified `ai-sdk-provider-codex-cli@1.2.2` is an AI SDK v6 provider, so implementation uses `codex exec --json` behind the AI SDK 7 UI message stream instead of importing the v6 provider.
- 2026-07-01T01:24:39+02:00: Verified local Codex CLI availability (`codex-cli 0.142.4`), local Codex auth file presence without printing secrets, and JSONL event shape from `codex exec --json --sandbox read-only --ephemeral`.
- 2026-07-01T01:24:39+02:00: Implemented local Codex CLI streaming backend, test command override hooks, unavailable-Codex fallback, and fake-Codex CLI stream test; removed external harness dependencies from the root package.
- 2026-07-01T01:24:39+02:00: Focused validation passed: `node --check .delano\viewer\server.js`; `node --test test\viewer-server.test.js`.
- 2026-07-01T01:29:46+02:00: Live local CLI smoke passed with the exact server flags: `codex exec --json --sandbox read-only --ephemeral --ignore-user-config --ignore-rules -c approval_policy="never"` returned an `item.completed` agent message with `OK`; stderr warnings were non-blocking CLI/plugin warnings.
- 2026-07-01T01:36:00+02:00: `pi -p` second-opinion review found no blocking bugs in the local Codex CLI subscription-auth implementation. It noted a possible future duplicate-output risk if Codex emits both deltas and completed messages; parser was hardened to dedupe completed text after prior deltas and covered by the fake CLI stream test.
- 2026-07-01T01:36:00+02:00: Focused validation passed after parser hardening: `node --check .delano\viewer\server.js`; `node --test test\viewer-server.test.js`.

- 2026-06-30T23:14:50Z: Implementing local Codex CLI subscription-auth chat backend for T-009.

- 2026-06-30T23:14:42Z: Reopening to replace external-auth harness path with local Codex CLI subscription-auth backend per user correction.

- 2026-06-30T22:56:10Z: Implemented AI SDK UI message stream endpoint, gated Codex harness path, fallback stream, and server tests; live Codex sandbox execution remains external-auth gated.

- 2026-06-30T22:49:14Z: Implementing AI SDK UI message stream endpoint and gated Codex harness path.
- 2026-07-01T00:18:00Z: Replaced custom chat SSE with `createUIMessageStream` / `pipeUIMessageStreamToResponse`; disabled fallback and optional Codex harness now share the same AI SDK UI message stream response shape.
- 2026-07-01T00:18:00Z: Added server tests for AI SDK harness imports, fallback UI message stream chunks, invalid chat payloads, and no markdown writes from chat. Live Codex sandbox streaming was not run because no Vercel/OpenAI/AI Gateway environment is configured.
- 2026-07-01T00:18:00Z: Validation passed: `node --test test/viewer-server.test.js`.
- 2026-07-01T00:42:00Z: Claude follow-up review confirmed abort propagation now uses an `AbortController`, Codex permission mode is `allow-reads`, and text-delta handling covers both `part.text` and `part.delta`; no blocking server issue remained.
- 2026-06-30T22:20:50Z: Created from .project/templates/task.md by `delano task add`.
