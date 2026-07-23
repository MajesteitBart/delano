---
id: T-003
name: Derive a truthful project dashboard model
status: done
workstream: WS-A
created: 2026-07-13T21:59:58Z
updated: 2026-07-13T22:10:53Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-006, AC-007]
---

# Task: Derive a truthful project dashboard model

## Description

Create a pure dashboard domain model that groups canonical task states, derives per-workstream completion, selects the spec brief, orders recent progress evidence, and handles empty or legacy values without fabricating history.

## Acceptance Criteria
- [x] Every indexed task is represented exactly once in done, active, blocked, planned, or deferred totals.
- [x] Workstream summaries expose total, done, open, blocked, and a bounded completion percentage.
- [x] The latest project update is derived from project documents and recent evidence sorts newest first.
- [x] Empty, completed, single-workstream, and unknown-status fixtures produce deterministic output.
- [x] Focused automated tests cover the derivation boundary.

## Traceability
- Story: US-004
- Acceptance criteria: AC-006, AC-007

## Technical Notes

Use indexed `DocMeta` and `ProjectIndex` fields. Do not add historical series, completion forecasts, or a server endpoint unless the current index proves insufficient.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs impact completed in T-005

## Evidence Log

- 2026-07-13T22:10:53Z: npm run test:domain passed with mixed, unknown, empty, completed-percentage, single-workstream, evidence-ordering, and latest-update assertions; npm run typecheck and targeted ESLint passed.

- 2026-07-13T22:08:40Z: Beginning dependency-safe dashboard domain derivation.

- 2026-07-13T22:02:07Z: Readiness reviewed: approved spec and plan, deterministic indexed inputs, complete acceptance criteria, no unresolved dependency.
- 2026-07-13T21:59:58Z: Created from .project/templates/task.md by `delano task add`.
