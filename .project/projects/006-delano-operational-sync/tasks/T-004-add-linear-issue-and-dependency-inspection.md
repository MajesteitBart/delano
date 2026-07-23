---
id: T-004
name: Add Linear issue and dependency inspection
status: done
workstream: WS-C
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:28:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add Linear issue and dependency inspection

## Description
Fetch or mock Linear issue state, ownership, project, and dependency data for comparison.

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

- 2026-04-29T23:28:00Z: Inspected local sync map and registry state after `467178f`. Added mock-safe Linear inspection via `scripts/check-linear-issue-inspection.mjs` and `.agents/fixtures/linear/issue-snapshot.json` to compare local Linear issue IDs, project IDs, and dependency hints without remote writes; mirrored assets to `.claude`, wired `check:linear-inspection` into PM validation and package tests, and staged the fixture/script in the npm payload. Validation passed: `npm run check:linear-inspection`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
