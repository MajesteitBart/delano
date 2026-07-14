---
id: T-001
name: Repair table framing and explicit project navigation
status: done
workstream: WS-A
created: 2026-07-13T20:18:44Z
updated: 2026-07-13T20:23:32Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [.delano/viewer/ui/src/components/**, .delano/viewer/ui/src/pages/**, .delano/viewer/ui/src/app/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002]
---

# Task: Repair table framing and explicit project navigation

## Description

Remove nested Card framing around ledger tables, improve shared cell padding, and add an explicit project-table action that selects a project and opens Project overview without changing selector/worktree intent preservation.

## Acceptance Criteria
- [x] Populated ledger tables render with one border and no surrounding Card/CardContent wrapper.
- [x] Shared table cells and headers use comfortable horizontal and vertical padding without removing wide-table scrolling.
- [x] Activating any Workspace project name selects that project and renders Project overview.
- [x] Project selector and worktree switches still preserve semantic destinations.

## Traceability
- Story: US-001 US-002
- Acceptance criteria: AC-001 AC-002

## Technical Notes

- Keep the table's own rounded border as the only ledger boundary.
- Use a dedicated `openProjectOverview(slug)` navigation action for explicit project links.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T20:23:32Z: Viewer typecheck/build passed; T3 confirmed project activation renders Project overview, DataTable has one boundary, no Card ancestor, and 10px by 12px cell padding.

- 2026-07-13T20:19:51Z: Live reproduction and source inspection confirm the table framing and explicit project-navigation defects.
- 2026-07-13T20:18:44Z: Created from .project/templates/task.md by `delano task add`.
