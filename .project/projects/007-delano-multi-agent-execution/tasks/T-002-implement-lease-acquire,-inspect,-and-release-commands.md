---
id: T-002
name: Implement lease acquire, inspect, and release commands
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T01:27:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Implement lease acquire, inspect, and release commands

## Description
Add CLI/script support for creating, listing, refreshing, and releasing path leases.

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

- 2026-04-30T01:27:00Z: Inspected lease contract state after `a219bcd`. Added `scripts/lease-manager.mjs` with acquire, inspect/list, release, and self-test commands backed by `.agents/leases/active-leases.json`; mirrored to `.agents` and `.claude`, wired `check:lease-manager` into PM validation and tests, and staged it in the npm payload. Validation passed: `npm run check:lease-manager`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
