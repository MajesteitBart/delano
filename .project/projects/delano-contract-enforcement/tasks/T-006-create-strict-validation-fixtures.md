---
id: T-006
name: Create strict validation fixtures
status: done
workstream: WS-D
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:30:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004, T-005]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Create strict validation fixtures

## Description
Add valid and invalid fixture projects for missing evidence, broken dependencies, stale context, path leaks, and invalid transitions.

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
- 2026-04-29T23:30:00Z: Inspected clean branch state at `ab6ecb6`. Added represented strict validation fixture projects under `.agents/validation-fixtures/strict/` for valid minimal project, missing evidence, broken dependencies, stale context, path leak, and invalid transition cases. Added `scripts/check-strict-fixtures.mjs`, mirrored runtime assets to `.claude`, wired `check:strict-fixtures` into PM validation and tests, and rebuilt `assets/payload`. Validation passed: `npm run check:strict-fixtures`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
