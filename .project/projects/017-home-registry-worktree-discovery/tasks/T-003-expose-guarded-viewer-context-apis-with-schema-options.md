---
id: T-003
name: Expose guarded viewer context APIs with schema options
status: done
workstream: WS-A
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T11:56:43Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002]
conflicts_with: [.delano/viewer/server.js, test/viewer-server.test.js]
parallel: false
priority: high
estimate: XL
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-005, AC-007]
---

# Task: Expose guarded viewer context APIs with schema options

## Description

Refactor the viewer server from one global root to an explicit active repository/worktree context with inventory and switch APIs. A switch is a full teardown and reinitialize of all root-scoped state (index, watchers, caches, write baselines) guarded by a generation token — no per-subsystem parameterization. Extract artifact-schema enum options from the selected root and carry them on the existing context/index payload.

## Acceptance Criteria
- [x] Context inventory returns registered repositories and fresh worktrees with the repository/worktree/project-data metadata defined by the spec, defaulting to the launch repository's primary worktree.
- [x] A switch accepts only a registered repository ID and Git-reported worktree identity; arbitrary, stale, traversal, symlink-escaped, or unavailable roots are rejected visibly, and requests during a switch receive an explicit retry response.
- [x] Index, documents, annotations, activity, SSE/watchers, handovers, expected hashes, and cached state are fully torn down and rebuilt on switch; the generation token invalidates late responses and events from the previous root.
- [x] Every mutating endpoint rejects linked-worktree context server-side, while existing guarded primary-worktree behavior remains covered by regression tests.
- [x] Schema enum options are extracted by artifact and field from the selected root's `.agents/schemas/artifacts/*.schema.json`, returned as canonical raw values in schema order on the context/index payload, reload on switch, and fail explicitly (no fallback vocabulary) when schemas are missing or malformed; a test asserts task status options equal the current `task.schema.json` enum.
- [x] Integration fixtures switch between two repositories and sibling worktrees without restarting the server.

## Traceability
- Story: US-002
- Acceptance criteria: AC-001 AC-002 AC-003 AC-005 AC-007

## Technical Notes

- Treat context change as a generation boundary: dispose watchers and invalidate late async/event results from the previous root.
- Keep filesystem paths in responses only where required for explicit user provenance; never accept those paths back as authority.
- UI types describe generic schema-option records; do not unionize the enum values.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T11:56:43Z: Added registered repository/worktree inventory and guarded switching with full root reset, generation-aware watchers/requests, linked-write denial, persistent provenance, and schema-derived enum metadata. node --test test/viewer-server.test.js: 12 passed. Focused context/handover rerun: 3 passed. node -c server and git diff --check passed.

- 2026-07-13T11:50:58Z: Refactoring viewer server to active repository/worktree context with schema options and switch isolation.

- 2026-07-13T11:50:58Z: T-001 and T-002 dependencies are done; guarded viewer context scope readiness-reviewed.
- 2026-07-13T10:57:56Z: Created during plan condensation; merges the prior T-005 (context APIs) and T-007 (schema options) which shared the server.js conflict zone, and replaces per-subsystem parameterization with full-reset switching.
