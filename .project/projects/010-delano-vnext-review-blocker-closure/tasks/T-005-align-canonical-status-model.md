---
id: T-005
name: Align canonical status model
status: done
workstream: WS-C
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [T-006]
parallel: false
priority: high
estimate: L
---

# Task: Align canonical status model

## Description

Choose and apply one canonical status model across the handbook, schemas, templates, validators, and current project artifacts.

## Acceptance Criteria

- [x] A decision records the canonical statuses for specs, plans, workstreams, and tasks.
- [x] `HANDBOOK.md` status examples match the canonical model.
- [x] `.agents/schemas/` status enums match the canonical model.
- [x] `.project/templates/` status placeholders match the canonical model.
- [x] Current project artifacts are migrated or explicitly grandfathered with validation behavior documented.
- [x] Status-related validation passes without new release-blocking contradictions.

## Technical Notes

- Current drift includes handbook examples such as `draft`, `approved`, `backlog`, `review`, and `canceled` while schemas use `planned`, `active`, `complete`, `done`, and `deferred` variants.
- Keep migration decisions explicit; do not silently redefine historical artifacts.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved handbook/schema/template drift blocker; implementation evidence pending.
- 2026-05-04T09:35:25Z: Aligned handbook and templates to the schema-backed v0.2 status model: specs `planned|active|complete|deferred`, plans/workstreams `planned|active|done|deferred`, tasks `ready|in-progress|blocked|done|deferred`. Validation passed: `node scripts/check-artifact-scope.mjs`; `node scripts/check-status-transitions.mjs`; `bash .agents/scripts/pm/validate.sh`.
