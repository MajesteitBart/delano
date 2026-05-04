---
id: T-003
name: Implement context audit scoring
status: done
workstream: WS-B
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T02:17:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Implement context audit scoring

## Description
Classify context files as real, placeholder, stale, missing required commands, or not applicable.

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

- 2026-04-30T02:17:00Z: Inspected learning metrics state after `04e83f1`. Added `scripts/audit-context-scoring.mjs` to classify required context paths as real, placeholder, stale, missing, or not applicable; mirrored to `.agents` and `.claude`, wired `check:context-audit` into PM validation and tests, and staged it in npm payload. Validation passed: `npm run check:context-audit`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.

- 2026-04-30T02:18:00Z: Inspected learning-loop state after project metrics summary. Added `scripts/audit-context-files.mjs` to score `.project/context` markdown as real, placeholder, stale, missing required commands, or not applicable with repo-relative evidence only; mirrored to `.agents` and `.claude`, wired `check:context-audit` into PM validation and tests, and staged it in npm payload. Validation passed: `npm run check:context-audit`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.

- 2026-04-30T02:18:00Z: Inspected context pack and learning-loop metric state after `04e83f1`. Added `scripts/check-context-audit.mjs` to score required `.project/context` files as real, placeholder, stale, missing required commands, missing, or not applicable; mirrored to `.agents` and `.claude`, wired `check:context-audit` into PM validation and tests, and staged it in npm payload. Validation passed: `npm run check:context-audit`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
