---
id: T-008
name: Add task detail workstream navigation
status: blocked
workstream: WS-A
created: 2026-05-11T12:08:00Z
updated: 2026-05-11T12:08:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-006]
conflicts_with: []
parallel: false
priority: high
estimate: M
blocked_owner: bart
blocked_check_back: 2026-05-12
---

# Task: Add task detail workstream navigation

## Description

Improve task detail navigation so a task page exposes clear paths back to its parent workstream and sideways to sibling tasks in the same workstream.

## Acceptance Criteria
- [ ] Task detail pages show a clickable parent workstream action or breadcrumb.
- [ ] Task detail pages show sibling tasks from the same workstream as quick navigation items.
- [ ] The currently selected task is visually distinguished from sibling tasks.
- [ ] Right-side metadata uses clickable references where the target is known, instead of rendering all related items as inert text.
- [ ] Existing back behavior, source-contract navigation, and all-tasks navigation remain available and understandable.

## Technical Notes

- Use the existing workstream/task outline relationship before adding new data sources.
- Prefer a compact hierarchy in the metadata rail or adjacent quick-navigation panel.
- This task comes from viewer feedback issue 6.
- Blocked until `T-006` settles the workstream/task prominence and duplication model.

## Definition of Done
- [ ] Implementation complete
- [ ] Browser smoke test covers parent workstream and sibling task navigation
- [ ] Review complete
- [ ] Evidence recorded

## Evidence Log
- 2026-05-11T12:08:00Z: Task created from viewer feedback note issue 6; implementation evidence pending.
