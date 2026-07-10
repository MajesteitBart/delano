---
id: T-003
name: Build shared table query and work selectors
status: planned
workstream: WS-B
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [.delano/viewer/ui/src/lib/domain/**, .delano/viewer/ui/src/components/molecules/**]
parallel: true
priority: high
estimate: L
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-002, AC-005, AC-006]
---

# Task: Build shared table query and work selectors

## Description

Create pure search/filter/stable-sort/query-state utilities, reusable table controls, typed task metadata, and deterministic Home/Review/Plan selectors; keep table cells local.

## Acceptance Criteria

- [ ] Shared controls support visible search, relevant filters, sortable headers, result count, reset, accessible names, and missing-last stable ordering
- [ ] All query operations run before pagination and query changes reset page state
- [ ] Fixture tests cover multi-filter AND/OR, natural IDs, dates, missing values, dependency safety, mutual exclusivity, ranking, and evidence summaries

## Traceability
- Story: US-003
- Acceptance criteria: AC-002 AC-005 AC-006

## Technical Notes

- Keep query functions generic over records, but let each table own cells and filter declarations.
- Search normalizes case and whitespace; missing values sort last in both directions; stable ties use natural ID/path comparison.
- Different filter fields combine with AND. Selected values within one field combine with OR. Reset restores each table's explicit default sort/filter state.
- Implement the exact Plan categories from FR-11 and export category explanations for the UI so labels and logic cannot drift.
- Extend `DocMeta` typing for server fields already emitted (`dependsOn`) and selected frontmatter values without changing canonical task documents.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
