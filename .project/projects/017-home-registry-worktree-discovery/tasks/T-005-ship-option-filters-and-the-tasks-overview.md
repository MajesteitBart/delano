---
id: T-005
name: Ship option filters and the Tasks overview
status: done
workstream: WS-A
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T12:14:41Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: [.delano/viewer/ui/src/components/molecules/DataTable.tsx, .delano/viewer/ui/src/lib/data-table.ts, .delano/viewer/ui/src/pages/WorkspacePage.tsx, .delano/viewer/ui/src/lib/domain/**, .delano/viewer/ui/src/components/organisms/**]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-007, AC-008, AC-009]
---

# Task: Ship option filters and the Tasks overview

## Description

Extend the shared TanStack DataTable with accessible exact-value single/multi-select option filters fed by the schema options from the context payload, then rename the workspace Open work route to Tasks, feed it every indexed task, and connect the status column to canonical task-schema options. As part of the same navigation cleanup, collapse the sidebar's per-update Progress file list into one Progress entry presented like Decisions.

## Acceptance Criteria
- [x] Column metadata can select text or option filtering and receives generic raw-value/label pairs; option filters support multi-select, selected-state visibility, clear-one/clear-all, keyboard operation, and exact raw-value membership filtering.
- [x] Sorting, pagination totals/reset, empty states, and existing text-filter tables continue to work after option filters are added.
- [x] Sidebar copy, page heading, description, empty states, and counts consistently use “Tasks”; planned, ready, in-progress, blocked, done, and deferred tasks appear when unfiltered and can be selected in any status combination through schema-derived options.
- [x] Each row retains task, project, workstream, priority, estimate, updated, and navigation behavior; versioned stored navigation referencing `workspace-current` migrates or falls back to Tasks without a broken route.
- [x] The sidebar shows a single Progress entry (like Decisions) instead of one item per update file; the progress view it opens lists every update, and stored navigation pointing at a specific update file falls back cleanly.
- [x] Component/domain tests cover single and multiple selections, hyphenated values, label/value separation, clearing, no-option/error behavior, and all-status counts and filtering.

## Traceability
- Story: US-003
- Acceptance criteria: AC-007 AC-008 AC-009

## Technical Notes

- Use TanStack filter values as arrays/sets of canonical strings; do not reuse `includesString` for enum membership. Reuse existing shadcn primitives before adding dependencies.
- Keep the dedicated Blockers projection if it remains useful; it derives from the same canonical task model.
- Rename domain variables such as `current`/`open` so future code does not reintroduce the hidden done-task assumption.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T12:14:41Z: Exact raw-value multi-select filtering, all-status task rows, pagination reset, navigation migration, and single Progress entry implemented; typecheck, domain checks, 12 focused component checks, targeted lint, and build passed.

- 2026-07-13T12:14:41Z: Implemented generic exact-value option filters, schema-derived all-status Tasks view, versioned navigation migration, and consolidated Progress entry. Validation: typecheck, domain checks, 12 focused component checks, targeted lint, and production build passed.

- 2026-07-13T12:08:54Z: Implementing canonical schema filters and consolidated Tasks overview.

- 2026-07-13T12:08:53Z: T-004 is done; T-005 is dependency-safe and selected for schema-driven filters and Tasks overview implementation.
- 2026-07-13T10:57:56Z: Created during plan condensation; merges the prior T-008 (option filters) and T-009 (Tasks overview), one sequential UI change consuming the schema options landed in T-003.
- 2026-07-13T11:13:31Z: Operator sidebar review added the single Progress entry consolidation (AC-009).
