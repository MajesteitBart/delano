---
id: T-001
name: Define sync schemas and drift taxonomy
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T00:42:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Define sync schemas and drift taxonomy

## Description
Create typed contracts for mapping drift, status drift, dependency drift, orphan drift, and repair recommendations.

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
- 2026-04-29T23:51:00Z: Inspected current sync registry/mapping shape and added local-first sync contracts: `.agents/schemas/sync/drift-taxonomy.json`, `.agents/schemas/sync/sync-map.schema.json`, script mirrors, `scripts/check-sync-schemas.mjs`, PM validation wiring, package script, install manifest entries, and npm test coverage. Validation passed: `.agents/scripts/pm/validate.sh`; `npm test` (22 tests).
- 2026-04-30T00:42:00Z: Inspected clean branch state at `8c8a8d8`. Added represented sync contracts under `.agents/schemas/sync/` for `drift-taxonomy.json` and `sync-map.schema.json`, covering mapping drift, status drift, dependency drift, orphan drift, and repair recommendations with local-first repair posture. Added `scripts/check-sync-schemas.mjs`, mirrored runtime assets to `.claude`, wired `check:sync-schemas` into PM validation and tests, and rebuilt `assets/payload`. Validation passed: `npm run check:sync-schemas`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.

- 2026-04-29T22:58:00Z: Inspected current branch after strict fixture validation. Added `.agents/schemas/sync/drift-taxonomy.json` and `.agents/schemas/sync/sync-map.schema.json`, mirrored them to `.claude`, added `scripts/check-sync-schemas.mjs`, wired `check:sync-schemas` into PM validation and package tests, and staged the schemas in the npm install manifest. Validation passed: `npm run check:sync-schemas`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
