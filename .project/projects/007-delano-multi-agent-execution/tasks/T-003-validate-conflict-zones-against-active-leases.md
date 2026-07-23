---
id: T-003
name: Validate conflict zones against active leases
status: done
workstream: WS-D
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T01:36:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Validate conflict zones against active leases

## Description
Fail or warn when tasks, workstreams, or updates collide with active exclusive ownership.

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

- 2026-04-30T01:36:00Z: Inspected lease manager state after `2729bf4`. Added `scripts/check-lease-conflicts.mjs` to compare requested conflict zones with active unexpired leases and fail overlapping exclusive/shared requests; mirrored to `.agents` and `.claude`, wired `check:lease-conflicts` into PM validation and tests, and staged it in npm payload. Validation passed: `npm run check:lease-conflicts`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
