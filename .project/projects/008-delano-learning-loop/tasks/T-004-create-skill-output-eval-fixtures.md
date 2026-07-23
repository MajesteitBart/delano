---
id: T-004
name: Create skill output eval fixtures
status: done
workstream: WS-C
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T02:24:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Create skill output eval fixtures

## Description
Add good and bad examples for discovery, breakdown, execution, quality, sync, and closeout outputs.

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

- 2026-04-30T02:24:00Z: Inspected context audit state after `9b1b5ac`. Added valid and invalid `.agents/eval-fixtures/skill-output` fixtures plus `scripts/check-skill-output-evals.mjs` to verify evidence-backed, metadata-only skill output; mirrored fixtures and checker to `.claude`, added npm script and package payload entries. Validation passed: `npm run check:skill-output-evals`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
