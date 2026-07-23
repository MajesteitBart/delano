---
id: T-006
name: Update handbook v0.2 runtime model
status: done
workstream: WS-C
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005]
conflicts_with: [T-005]
parallel: false
priority: high
estimate: L
---

# Task: Update handbook v0.2 runtime model

## Description

Update the central handbook so it accurately describes the implemented v0.2 runtime foundation and its deferred maturity boundaries.

## Acceptance Criteria

- [x] `HANDBOOK.md` explains operating modes 0 through 4 and when each applies.
- [x] `HANDBOOK.md` explains contract validation, artifact schemas, evidence-map expectations, and strict fixtures without overclaiming full instance validation.
- [x] `HANDBOOK.md` explains dry-run sync and apply-gated repair boundaries.
- [x] `HANDBOOK.md` explains lease lifecycle, conflict zones, and handoff expectations.
- [x] `HANDBOOK.md` distinguishes v0.2 must-have gates from later maturity gates.
- [x] Handbook references match the canonical status model from T-005.

## Technical Notes

- Move this task to `ready` after the canonical status decision is made.
- Keep handbook language aligned with implemented behavior, not aspirational follow-up work.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved handbook update blocker; implementation evidence pending.
- 2026-05-04T09:35:25Z: Added the v0.2 runtime foundation section to `HANDBOOK.md`, covering operating modes, contract validation, evidence expectations, dry-run sync, lease semantics, release gates, and deferred maturity gates. Validation passed: `npm test`; `bash .agents/scripts/pm/validate.sh`.
