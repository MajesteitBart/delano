---
id: T-002
name: Implement safe context discovery and read library
status: blocked
workstream: WS-B
created: 2026-06-24T21:51:46Z
updated: 2026-06-24T21:51:46Z
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
blocked_owner: team
blocked_check_back: 2026-06-25
---

# Task: Implement safe context discovery and read library

## Description

Build the reusable, side-effect-free context reader that discovers `.project/context` markdown files, applies canonical order/profiles, validates selectors, reads bounded content, and returns stable metadata/content structures for CLI and server use.

## Acceptance Criteria

- [ ] Library discovers context markdown files under `.project/context` only.
- [ ] Library derives required files/order from `.project/context/README.md` where possible and falls back to the standard order.
- [ ] Exact file selectors and profile selectors are supported.
- [ ] Absolute paths, `..`, encoded traversal, non-context files, and symlink escapes fail closed.
- [ ] Returned metadata includes path, title, required/missing flags, byte/character counts, truncation state, and warnings.
- [ ] Read output is bounded by explicit max-character limits with deterministic truncation markers.
- [ ] Library has no write path and does not mutate `.project/context`.
- [ ] Unit tests cover happy paths and unsafe selectors.

## Traceability

- Story: US-001
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004

## Technical Notes

- Prefer a small plain-JS helper under `src/cli/lib/` unless implementation discovers a cleaner shared runtime location.
- Keep the helper independent of CLI stdout formatting so viewer/server code can consume the same behavior.
- Do not expose absolute local paths in returned public data; use repo-relative paths.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated if the helper surface is public enough to document

## Evidence Log

- 2026-06-24T21:51:46Z: Waiting for T-001 to define the context reader contract and ordering.
- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
