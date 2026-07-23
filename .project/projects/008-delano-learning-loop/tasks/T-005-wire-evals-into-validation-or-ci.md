---
id: T-005
name: Wire evals into validation or CI
status: done
workstream: WS-C
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T02:31:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Wire evals into validation or CI

## Description
Make eval fixtures executable enough to catch regressions in generated artifacts and skill outputs.

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

- 2026-04-30T02:31:00Z: Inspected eval fixture state after `17b6ca7`. Wired `check-skill-output-evals.mjs` into `.agents/scripts/pm/validate.sh` and `.claude/scripts/pm/validate.sh`, and added a package test asserting the validation hook remains present. Validation passed: `bash .agents/scripts/pm/validate.sh` and `npm test`.
