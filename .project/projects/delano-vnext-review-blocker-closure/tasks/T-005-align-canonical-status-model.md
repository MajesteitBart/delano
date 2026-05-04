---
id: T-005
name: Align canonical status model
status: ready
workstream: WS-C
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
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

- [ ] A decision records the canonical statuses for specs, plans, workstreams, and tasks.
- [ ] `HANDBOOK.md` status examples match the canonical model.
- [ ] `.agents/schemas/` status enums match the canonical model.
- [ ] `.project/templates/` status placeholders match the canonical model.
- [ ] Current project artifacts are migrated or explicitly grandfathered with validation behavior documented.
- [ ] Status-related validation passes without new release-blocking contradictions.

## Technical Notes

- Current drift includes handbook examples such as `draft`, `approved`, `backlog`, `review`, and `canceled` while schemas use `planned`, `active`, `complete`, `done`, and `deferred` variants.
- Keep migration decisions explicit; do not silently redefine historical artifacts.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved handbook/schema/template drift blocker; implementation evidence pending.
