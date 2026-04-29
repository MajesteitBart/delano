---
id: T-006
name: Add closeout learning proposal workflow
status: done
workstream: WS-D
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T02:38:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-003]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add closeout learning proposal workflow

## Description
Require closeouts to propose specific rule, skill, schema, or fixture updates with review before adoption.

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

- 2026-04-30T02:38:00Z: Inspected validation-wired eval state after `8694b87`. Added `scripts/propose-closeout-learning.mjs` to generate summary-only, dry-run closeout learning proposals with no mutation path; mirrored to `.agents` and `.claude`, wired `check:closeout-learning` into PM validation and tests, and staged it in npm payload. Validation passed: `npm run check:closeout-learning`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.

- 2026-04-30T02:42:00Z: Inspected closeout skill state after eval wiring. Added `closeout-learning-proposal` schema and closeout template requiring proposed rule, skill, schema, or fixture updates to remain proposed until reviewed before adoption; updated closeout skill/runbook/checklist, mirrored to `.claude`, wired `check:closeout-learning` into validation and tests, and staged package assets. Validation passed: `npm run check:closeout-learning`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
