---
id: T-003
name: Persist viewer navigation state
status: ready
workstream: WS-A
created: 2026-05-11T09:52:00Z
updated: 2026-05-11T09:52:00Z
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
- [ ] Viewer restores the last selected workspace route, project, document, workstream, and pagination state where applicable.
- [ ] When no stored state exists, the viewer opens a workspace overview or dashboard instead of a single project detail page.
- [ ] Stored state handles missing or deleted projects/documents gracefully by falling back to a valid overview.
- [ ] Storage behavior is local to the browser and does not change server APIs or repository contracts.

## Technical Notes

- Prefer `localStorage` or `sessionStorage` with a small versioned state shape.
- Keep fallback behavior deterministic when stored paths no longer exist.
- This task comes from viewer feedback issue 1.

## Definition of Done
- [ ] Implementation complete
- [ ] Browser refresh smoke test passes
- [ ] Review complete
- [ ] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
