---
id: T-002
name: Add initial schemas for core project artifacts
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T22:44:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add initial schemas for core project artifacts

## Description
Create schema files for spec, plan, workstream, task, decision, update, context, and evidence artifacts.

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
- 2026-04-29T22:44:00Z: Inspected branch state on `feat/delano-vnext-runtime-upgrade` at `8dc0ae7`. Added initial JSON schemas for spec, plan, workstream, task, decision log, update, context, and evidence artifacts under `.agents/schemas/artifacts/`, linked them from `artifact-scope.json`, mirrored runtime assets into `.claude`, added `scripts/check-artifact-schemas.mjs` plus package/PM validation wiring, and rebuilt `assets/payload`. Validation passed: `npm run check:artifact-schemas`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
