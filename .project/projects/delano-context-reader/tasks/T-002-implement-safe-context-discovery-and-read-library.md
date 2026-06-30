---
id: T-002
name: Implement safe context discovery and read library
status: done
workstream: WS-B
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:32:36Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [src/cli/lib, .delano/viewer/server.js]
parallel: true
priority: high
estimate: M
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004]
---

# Task: Implement safe context discovery and read library

## Description

Build the reusable, side-effect-free context reader that discovers `.project/context` markdown files, applies canonical order/profiles, validates selectors, reads bounded content, and returns stable metadata/content structures for CLI and server use.

## Acceptance Criteria

- [x] Library discovers context markdown files under `.project/context` only.
- [x] Library derives required files/order from `.project/context/README.md` where possible and falls back to the standard order.
- [x] Exact file selectors and profile selectors are supported.
- [x] Absolute paths, `..`, encoded traversal, non-context files, and symlink escapes fail closed.
- [x] Returned metadata includes path, title, required/missing flags, byte/character counts, truncation state, and warnings.
- [x] Read output is bounded by explicit max-character limits with deterministic truncation markers.
- [x] Library has no write path and does not mutate `.project/context`.
- [x] Unit tests cover happy paths and unsafe selectors.

## Traceability

- Story: US-001
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004

## Technical Notes

- Prefer a small plain-JS helper under `src/cli/lib/` unless implementation discovers a cleaner shared runtime location.
- Keep the helper independent of CLI stdout formatting so viewer/server code can consume the same behavior.
- Do not expose absolute local paths in returned public data; use repo-relative paths.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated if the helper surface is public enough to document

## Evidence Log

- 2026-06-25T10:32:36Z: Implemented src/cli/lib/context-reader.js with README ordering, fallback order, profile selection, safe exact selectors, symlink escape protection, stable list/read metadata, bounded reads, markdown formatting, and truncation warnings. Passed focused test command: node --test --test-name-pattern context-reader test/cli.test.js. Live smoke passed against this repo: 11 context files, 0 missing required files, implementation profile 6 files and 8289 chars untruncated.

- 2026-06-25T10:29:38Z: Implementing shared read-only context discovery and profile selection helper from the approved contract

- 2026-06-25T10:29:34Z: Dependency T-001 is done; context reader contract is now implementation-ready.

- 2026-06-24T21:51:46Z: Waiting for T-001 to define the context reader contract and ordering.
- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
