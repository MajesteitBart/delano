---
id: T-003
name: Introduce operating modes 0 through 4
status: done
workstream: WS-B
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T22:55:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Introduce operating modes 0 through 4

## Description
Document and validate patch, scoped change, feature, uncertain feature, and multi-stream delivery modes.

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
- 2026-04-29T22:55:00Z: Inspected clean branch state at `1e8da86`. Added `.agents/schemas/operating-modes.json` for modes 0 through 4, documented the mode table in `.agents/rules/delivery-modes.md`, added optional `operating_mode` support to core artifact contracts, mirrored compatibility assets under `.claude`, wired `check-operating-modes` into package tests and PM validation, and rebuilt the install manifest payload. Validation passed: `npm run check:operating-modes`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
