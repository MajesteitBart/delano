---
id: T-004
name: Implement status transition validation
status: done
workstream: WS-B
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:08:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Implement status transition validation

## Description
Prevent invalid transitions such as ready with unresolved dependencies or blocked without owner/check-back.

## Acceptance Criteria
- [x] Current repo state has been inspected before implementation starts.
- [x] The delivered change is represented in Delano runtime assets, project contracts, validation, fixtures, or docs as appropriate.
- [x] The change is validated with the smallest meaningful command or fixture.
- [x] Evidence is recorded in this task or a task update before the task is marked done.

## Technical Notes
- This task came from the Delano next-step roadmap review.
- Keep behavior additive or dry-run-first when the task touches validation, remote sync, logs, or write-capable commands.
- Do not claim completion from documentation alone unless the task is explicitly documentation-only.

## Definition of Done
- [x] Implementation or contract creation complete
- [x] Validation or focused test passes
- [x] Review complete
- [x] Docs updated where behavior changes

## Evidence Log
- 2026-04-28T23:14:00Z: Task created from roadmap review; implementation evidence pending.
- 2026-04-29T23:08:00Z: Inspected clean branch state at `52a5157`. Added `.agents/schemas/status-transitions.json` and `scripts/check-status-transitions.mjs` to validate proposed transitions and current task hygiene: proposed `ready`, `in-progress`, or `done` transitions fail with unresolved dependencies, and proposed/current `blocked` tasks require `blocked_owner` plus `blocked_check_back`. Current backlog `ready` dependency issues are surfaced as warnings so additive validation does not break existing roadmaps before strict fixture migration. Mirrored assets to `.claude`, wired `check:status-transitions` into PM validation and tests, and rebuilt `assets/payload`. Validation passed: `npm run check:status-transitions`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
