---
id: T-004
name: Make next task selection stream-aware
status: done
workstream: WS-B
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T01:42:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Make next task selection stream-aware

## Description
Prefer ready tasks that do not violate leases, dependencies, or current stream capacity.

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

- 2026-04-30T01:42:00Z: Inspected multi-agent state after `51a918a`. Added `scripts/select-next-task.mjs` with `--stream` aware ready-task selection and active lease conflict-zone filtering; mirrored runtime assets to `.agents` and `.claude`, wired `check:next-task` into PM validation and tests, and staged it in npm payload. Validation passed: `npm run check:next-task`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
