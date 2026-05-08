---
id: T-001
name: Global workspace navigation
status: done
workstream: WS-A
created: 2026-05-08T09:44:35Z
updated: 2026-05-08T09:44:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: false
priority: medium
estimate: M
---

# Task: Global workspace navigation

## Description

Separate the left navigation from project-specific dashboard sections. The sidebar should expose workspace-wide views for open work, progress, validation, warnings, and blockers, while the selected project controls the project overview and source-contract details shown in the main pane.

## Acceptance Criteria
- [x] Sidebar no longer duplicates the selected project's overview sections as primary navigation.
- [x] Workspace navigation aggregates open work, progress, validation, warnings, and blockers across projects.
- [x] Workspace navigation shows count badges for aggregate views.
- [x] Workspace progress is sorted by recency and paginated.
- [x] Selecting a row in a workspace view opens the relevant project, document, or workstream in the main pane.

## Technical Notes

- Implemented in `.delano/viewer/public/app.jsx` with a workspace aggregate model and global route set.
- Styling lives in `.delano/viewer/public/styles.css`.
- This task records a corrective contract entry after an implementation pass was initially made without a Delano task ledger.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-08: Browser smoke test at `http://127.0.0.1:3977/` loaded with 0 console errors. Global sidebar sections rendered as Workspace, Selected project, and Source contracts. Progress view showed 10 rows with `Page 1 of 4`; Open work, Validation, Warnings, and Blockers views switched successfully with aggregate counts.
