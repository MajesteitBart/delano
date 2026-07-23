---
name: Viewer Table Refinement
slug: 019-viewer-table-refinement
owner: bart
status: complete
created: 2026-07-13T20:17:15Z
updated: 2026-07-13T21:13:56Z
outcome: Viewer ledger tables are spacious, directly navigable, consistently sorted, and filterable by relationship, canonical option, and date range while linked-worktree research remains verifiably visible.
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: Live T3 reproduction identified the project-row navigation defect and the stale shared server behind the research symptom; existing TanStack and shadcn primitives provide bounded extension points for the table behavior.
operating_mode: feature
---

# Spec: Viewer Table Refinement

## Executive Summary

Refine the viewer's shared ledger-table system: remove nested card framing, improve row padding, make project rows open project overview, default time-relevant tables to newest-first, add project creation dates, and replace free-text filters with searchable option or date-range controls where the data has a bounded vocabulary. Verify research end to end against the linked parity worktree.

## Problem and Users

The viewer wraps already-bordered data tables in another padded card, producing cramped nested surfaces. Project links select a project but remain on the Workspace Projects route, so the click appears broken. Tables with timestamps do not consistently open newest-first. Relationship and canonical enum columns fall back to error-prone free-text filtering, and datetime filters accept raw strings rather than useful date ranges. Finally, the shared preview process can show `Research 0` for a linked worktree even though the current server implementation indexes six files, making the feature look broken.

The affected users are maintainers and operators scanning delivery state across repositories and worktrees.

## Outcome and Success Metrics

- Every primary ledger table has one visual boundary, with comfortable row padding and no card-inside-card framing.
- Clicking a project name in Workspace Projects selects it and opens Project overview; project-selector and worktree changes continue preserving semantic intent.
- Tables with an Updated column default to descending Updated order unless the page explicitly opts out; Context pack retains canonical context order.
- Workspace Projects shows a Created column sourced from project contract frontmatter.
- Task Project and Workstream filters are searchable multi-select option filters generated from indexed relations.
- Task Status, Priority, and Estimate filters use canonical schema options; bounded document/status fields use option filters where reliable options are available.
- Updated and Created columns use a date-range filter with Today, Last 7 days, Last 30 days, This year, and Custom range behavior.
- The linked `worktree-viewer-ok-parity` context shows the six research documents for Viewer Annotations and Agent Handover after a current server restart, and an automated server fixture protects this path.

## User Stories
- US-001: As an operator, I want ledger tables to use their width efficiently, so dense state remains readable without nested framing.
- US-002: As an operator, I want project links to open project overview, so the primary project action has an immediate visible result.
- US-003: As an operator, I want newest evidence first and date-range filtering, so I can focus on recent changes quickly.
- US-004: As an operator, I want searchable relationship and canonical-option filters, so I can filter without remembering exact strings.
- US-005: As an operator comparing worktrees, I want project research to render from the active linked worktree, so evidence discovery is trustworthy.

## Acceptance Scenarios
- AC-001: Given a populated viewer table, when it renders, then the table has one boundary and rows use increased vertical and horizontal cell padding.
- AC-002: Given Workspace Projects, when a project name is activated, then that project is selected and Project overview becomes the active route.
- AC-003: Given a table with Updated data, when it first renders, then rows are newest-first; given Context pack, its canonical index order is unchanged.
- AC-004: Given Workspace Projects, when it renders, then Created is visible and sortable/filterable as a datetime column.
- AC-005: Given Workspace Tasks, when Project or Workstream filters open, then searchable multi-select choices reflect indexed related records.
- AC-006: Given task Status, Priority, or Estimate, when its filter opens, then choices come from canonical schema options and support multi-selection.
- AC-007: Given an Updated or Created filter, when a preset or custom date range is selected, then only values within the inclusive local-date range remain.
- AC-008: Given the linked parity worktree and Viewer Annotations and Agent Handover, when Research opens, then six nested research documents render and nested `progress.md` remains role `research`.

## Scope
### In Scope
- Shared DataTable presentation, initial sorting, option filtering, and date-range filtering.
- Workspace Projects, Tasks, Context, Annotations, warnings/blockers, and selected-project document tables.
- Project Created metadata already emitted by the viewer server.
- Project-table navigation semantics distinct from project-selector semantics.
- Current-server restart and linked-worktree browser verification.
- Focused fixtures, full tests, generated viewer/package assets, and documentation.

### Out of Scope
- Server-side pagination or filtering.
- Persisting table filter/sort state across sessions.
- Changing canonical schema vocabularies.
- Replacing the selected-project overview design with the supplied conceptual sketch.
- Publishing packages, committing, pushing, or mutating remote trackers.

## Functional Requirements

- FR-001: DataTable accepts explicit initial sorting and resets pagination when filters change.
- FR-002: Option-filter metadata supports searchable multi-select values and renders through the existing Command and Popover components.
- FR-003: Date-filter metadata uses ISO source values, an inclusive range filter, and preset/custom range selection with the shadcn Calendar component.
- FR-004: Date cells format values only for display; sorting and filtering operate on raw timestamp strings.
- FR-005: Workspace Project and Task table options are derived deterministically from current indexed rows and canonical schema options.
- FR-006: Workspace project links call a dedicated open-overview action; task relationship links may use the same explicit overview action.
- FR-007: Context pack does not receive initial Updated sorting even though it displays file timestamps.
- FR-008: Project `created` metadata is represented in the UI type/model and displayed in Workspace Projects.
- FR-009: Research browser verification runs against a newly started server so server source and compiled client are from the same worktree state.

## Non-Functional Requirements

- Filters are keyboard accessible, labelled, and do not require free-text knowledge for bounded fields.
- Date boundaries respect local calendar days and tolerate missing/invalid timestamps.
- Table changes remain generic and avoid page-specific filter implementations.
- Responsive horizontal scrolling remains available for wide task tables.
- The interface stays flat, quiet, and uses existing semantic tokens without nested cards or decorative elevation.

## Assumptions
- “Most tables” means every table exposing an Updated column, except Context pack whose canonical context-reader order is meaningful.
- Project clicks in the Workspace Projects table are explicit navigation; selector/worktree switches retain the previously implemented semantic-preservation behavior.
- Multi-select searchable popovers satisfy the requested combobox behavior for relationships and enums.
- Date presets are historical ranges: Today, Last 7 days, Last 30 days, and This year, plus a custom range calendar.

## Needs Clarification
- None. The annotated examples and enumerated behaviors provide an implementation-safe brief.

## Hypotheses and Unknowns

- The shared DataTable metadata layer can express option and date filters without page-specific UI branching.
- Restarting the shared viewer with current server source resolves the observed linked-worktree Research 0 state.

## Touchpoints to Exercise

- DataTable, table primitive, workspace/project table definitions, navigation hook/routes, viewer server project metadata, and package payload.
- Primary and linked-worktree project selection, research list, filter popovers, date presets/custom ranges, sorting, pagination, and narrow layout.

## Probe Findings

- Live T3 reproduction confirmed Workspace project links only changed the selected slug while the active Workspace route remained Projects.
- The shared `3978` process returned `Research 0`; an isolated current-server run previously returned six files for the same linked worktree, indicating process/source drift rather than missing research files.
- Project `created` is already emitted by `loadIndex`, but omitted from the TypeScript `ProjectIndex` model and workspace table.
- Canonical task status, priority, and estimate values already arrive through `schemaOptions.task`.

## Footguns Discovered

- Reusing selector-style semantic translation for an explicit project-table link creates the no-op behavior.
- Formatting timestamps in accessors breaks chronological filtering and sorting; accessors must retain raw ISO values.
- Applying Updated sorting to Context pack would destroy context-reader canonical order.
- A stale long-running viewer process can serve current compiled JS with old server indexing logic.

## Remaining Unknowns

- None material after source inspection and live reproduction.

## Dependencies

- TanStack React Table filtering/sorting state.
- Existing shadcn Command, Popover, Button, and Select components, plus Calendar/React DayPicker for custom ranges.
- Existing artifact schema options and viewer context-switch API.

## Approval Notes

- 2026-07-13T20:19:50Z: Operator-approved table and viewer regression refinement is ready for execution.

- Approved by the operator's seven-point annotated interface request on 2026-07-13.
