---
name: Viewer Table Refinement
status: done
lead: bart
created: 2026-07-13T20:17:15Z
updated: 2026-07-13T21:13:56Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: active
operating_mode: feature
---

# Delivery Plan: Viewer Table Refinement

## What Changed After Probe

Live reproduction separated explicit project-link navigation from selector intent preservation and isolated the Research 0 symptom to the stale shared process. Source inspection also found that project creation metadata and canonical task option vocabularies already exist at the server boundary.

## Technical Context

The Vite viewer uses a generic TanStack DataTable with column metadata for text and option filters. Workspace and project pages define column accessors and cells locally. Navigation stores a selected project and semantic route independently. The Node server indexes Markdown, emits project created timestamps and artifact schema enum options, and switches roots without restarting.

## Architecture Decisions

- Keep selector/worktree semantic translation unchanged. Add an explicit `openProjectOverview(slug)` action for table links that atomically selects the project and routes to overview.
- Remove Card/CardContent wrappers around DataTable call sites and let DataTable own the single ledger border. Increase shared Table head/cell padding so all tables improve consistently.
- Add `initialSorting` to DataTable and pass `[{ id: "updated", desc: true }]` only from pages with time-relevant Updated columns. Context pack explicitly opts out.
- Preserve raw ISO strings in datetime accessors and format only in cells. Add `dateRangeFilter` and date metadata to the shared table domain.
- Render bounded filters as searchable multi-select Command lists inside Popovers. Relationship options derive from the current row set; canonical enums derive from `schemaOptions`.
- Add the shadcn Calendar component and a reusable DateRangeFilter with historical presets and an inclusive local-date custom range.
- Model project `created` in ProjectIndex/ProjectStat and expose it beside Updated in Workspace Projects.
- Keep server research classification unchanged, but verify linked research through a current-process browser flow and strengthen fixture/source evidence where needed.

## Policy and Contract Checks
- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map
- `spec.md`: Created from `.project/templates` by `delano project create`.
- `plan.md`: Created from `.project/templates` by `delano project create`.
- `workstreams/`: Created from `.project/templates` by `delano project create`.
- `tasks/`: Created from `.project/templates` by `delano project create`.

## Complexity Exceptions
- None recorded.

## Probe-Driven Architecture Changes

## Workstream Design

- `WS-A Table and Navigation Refinement` owns the tightly coupled DataTable metadata/UI, workspace column definitions, explicit navigation behavior, linked research regression verification, documentation, generated assets, and closeout.

## Milestone Strategy

1. Repair explicit project navigation and remove nested table cards/padding defects.
2. Add deterministic default sorting and project Created metadata.
3. Add searchable relationship/enum filters and reusable date-range filtering.
4. Verify linked research on a fresh process, rebuild assets, run full gates, and close.

## Rollout Strategy

- Extend generic table metadata/filter functions first, then migrate page columns.
- Add Calendar through the project-aware shadcn CLI and review generated source before use.
- Rebuild compiled viewer only after focused type/domain/component tests pass.
- Restart the shared local viewer only after source/build validation, preserving the user's port.

## Test Strategy

- Domain fixtures for date range inclusivity, option membership, project created mapping, and initial sorting declarations.
- Component/source fixtures for one table boundary, no Card wrappers, searchable option controls, calendar presets, explicit project overview routing, and canonical enum wiring.
- Server fixture confirming linked-style nested research remains indexed as research.
- Viewer build/typecheck, focused tests, full `npm test`, package payload/drift, Delano release validation.
- T3 browser smoke for padding/boundary, project click, default sort, relationship/enum/date filters, Context order, linked research, responsiveness, and diagnostics.

## Rollback Strategy

- Initial sorting and filter metadata are additive DataTable props/types and can be removed independently.
- Project navigation action is isolated from selector translation and can fall back to the previous callback.
- Calendar is a source component with explicit dependencies; rollback removes the component and date metadata branch.
- Visual rollback restores table wrappers/padding without changing index or navigation data.

## Remaining Delivery Risks

- A range ending at midnight could exclude same-day timestamps; normalize the end to local end-of-day.
- Derived relationship option values must match accessors exactly, including `None`.
- Wide task tables still require horizontal scrolling; improved padding must not force page-level overflow.
- Restarting the shared server must target only the existing viewer process on port 3978.
