---
id: T-006
name: Add safe repair planning and apply gates
status: done
workstream: WS-D
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T01:12:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add safe repair planning and apply gates

## Description
Generate repair plans and require explicit operator confirmation before local or remote changes.

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

- 2026-04-30T01:12:00Z: Inspected current dry-run drift report implementation at `47ccecd`. Added `scripts/plan-sync-repairs.mjs` to turn report recommendations into non-mutating repair plans and block `--apply` unless an explicit approval token is supplied; mirrored runtime assets to `.agents` and `.claude`, wired `check:repair-plan` into PM validation and tests, and staged it in the npm payload. Validation passed: `npm run check:repair-plan`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
