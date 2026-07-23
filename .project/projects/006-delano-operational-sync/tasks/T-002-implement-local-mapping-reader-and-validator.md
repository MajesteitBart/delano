---
id: T-002
name: Implement local mapping reader and validator
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:08:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Implement local mapping reader and validator

## Description
Read local task, project, Linear, and GitHub references into one normalized sync model.

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

- 2026-04-29T23:08:00Z: Inspected current project registry and task contracts after `f595e46`. Added `scripts/check-local-sync-map.mjs` to read `.project/projects/*` plus `.project/registry/linear-map.json` into a normalized local sync map with project, task, Linear, GitHub, status, and dependency references; mirrored it to `.agents` and `.claude`, wired `check:local-sync-map` into PM validation and package tests, and staged it in the npm payload. Validation passed: `npm run check:local-sync-map`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
