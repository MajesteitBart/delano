---
id: T-001
name: Define artifact schema scope and canonical fields
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:35:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Define artifact schema scope and canonical fields

## Description
Inventory current artifacts and decide which fields are required, optional, enum-constrained, or derived.

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
- 2026-04-29T23:35:00Z: Inspected current `.project` artifact frontmatter across specs, plans, workstreams, and tasks. Added `.agents/schemas/artifact-scope.json` plus `.agents/schemas/README.md` to define the first schema scope, canonical required/optional fields, enum candidates, and derived fields for spec, plan, workstream, task, decision log, update, context, and evidence artifacts. Added `scripts/check-artifact-scope.mjs`, `npm run check:artifact-scope`, PM validation wiring, npm test coverage, and install-manifest entries for the schema scope assets. Validation passed: `npm run check:artifact-scope`.
