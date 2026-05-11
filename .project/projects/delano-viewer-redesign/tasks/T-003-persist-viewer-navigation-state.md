---
id: T-003
name: Persist viewer navigation state
status: done
workstream: WS-A
created: 2026-05-11T09:52:00Z
updated: 2026-05-11T15:25:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Persist viewer navigation state

## Description

Store and restore the viewer's navigation state so refreshes and new browser openings do not always reset to the first or most recent project.

## Acceptance Criteria
- [x] Viewer restores the last selected workspace route, project, document, workstream, and pagination state where applicable.
- [x] When no stored state exists, the viewer opens a workspace overview or dashboard instead of a single project detail page.
- [x] Stored state handles missing or deleted projects/documents gracefully by falling back to a valid overview.
- [x] Storage behavior is local to the browser and does not change server APIs or repository contracts.

## Technical Notes

- Prefer `localStorage` or `sessionStorage` with a small versioned state shape.
- Keep fallback behavior deterministic when stored paths no longer exist.
- This task comes from viewer feedback issue 1.

## Definition of Done
- [x] Implementation complete
- [x] Browser refresh smoke test passes
- [x] Review complete
- [x] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
- 2026-05-11T15:25:00Z: Implemented versioned localStorage navigation persistence in `.delano/viewer/public/app.jsx`. Browser smoke at `http://127.0.0.1:3978/` cleared stored state and confirmed the default route opens the Projects dashboard; selecting workspace Validation page 2, reloading, and reopening restored `workspace-validation` with `Page 2 of 9`. Console errors: 0.
