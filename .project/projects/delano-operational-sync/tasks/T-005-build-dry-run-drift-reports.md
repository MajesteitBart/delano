---
id: T-005
name: Build dry-run drift reports
status: done
workstream: WS-D
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T01:00:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-004]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Build dry-run drift reports

## Description
Expose a command that produces typed drift reports without mutating local or remote systems.

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
- 2026-04-30T01:00:00Z: Inspected clean branch state at `3765008`. Added dry-run drift report contract `.agents/schemas/sync/drift-report.schema.json` and `scripts/build-drift-report.mjs` to combine local sync map, GitHub fixture inspection, and Linear fixture inspection into a typed non-mutating report with explicit-approval repair recommendations. Mirrored runtime assets to `.agents` and `.claude`, wired `check:drift-report` into PM validation and tests, and rebuilt `assets/payload`. Validation passed: `npm run check:drift-report`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
