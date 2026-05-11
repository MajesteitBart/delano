---
id: T-008
name: Add task detail workstream navigation
status: done
workstream: WS-A
created: 2026-05-11T12:08:00Z
updated: 2026-05-11T15:25:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-006]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Add task detail workstream navigation

## Description

Improve task detail navigation so a task page exposes clear paths back to its parent workstream and sideways to sibling tasks in the same workstream.

## Acceptance Criteria
- [x] Task detail pages show a clickable parent workstream action or breadcrumb.
- [x] Task detail pages show sibling tasks from the same workstream as quick navigation items.
- [x] The currently selected task is visually distinguished from sibling tasks.
- [x] Right-side metadata uses clickable references where the target is known, instead of rendering all related items as inert text.
- [x] Existing back behavior, source-contract navigation, and all-tasks navigation remain available and understandable.

## Technical Notes

- Use the existing workstream/task outline relationship before adding new data sources.
- Prefer a compact hierarchy in the metadata rail or adjacent quick-navigation panel.
- This task comes from viewer feedback issue 6.
- Blocked until `T-006` settles the workstream/task prominence and duplication model.

## Definition of Done
- [x] Implementation complete
- [x] Browser smoke test covers parent workstream and sibling task navigation
- [x] Review complete
- [x] Evidence recorded

## Evidence Log
- 2026-05-11T12:08:00Z: Task created from viewer feedback note issue 6; implementation evidence pending.
- 2026-05-11T15:25:00Z: Added task-detail navigation in the document reader for task docs. Browser smoke at `http://127.0.0.1:3978/` opened a task from the workstream, confirmed clickable parent workstream `WS-A Workspace Navigation and Viewer UX`, 8 sibling task items, current sibling highlighting, clickable `workstream` metadata, and clickable `depends_on` metadata on `T-003`. Console errors: 0.
