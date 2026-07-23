---
id: T-004
name: Reader polish and open actions
status: done
workstream: WS-C
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: true
priority: medium
estimate: S
---

# Task: Reader polish and open actions

## Description

Address late prototype polish: keep badges/pills visually stable when titles wrap, and add read-only convenience actions to open the selected markdown file in the system explorer or VS Code.

## Acceptance Criteria
- [x] Pills and badges keep a consistent height beside multi-line titles.
- [x] Reader includes an "Open in system explorer" action.
- [x] Reader includes an "Open in VS Code" action.
- [x] Open actions are guarded to markdown files inside `.project`.
- [x] Open action failures return readable feedback.

## Technical Notes

- The viewer remains read-only; these buttons only bridge to external tools.
- VS Code open depends on the `code` CLI being available on the local PATH.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: CSS contains fixed pill sizing rules and reader action styling.
- 2026-04-28: Server exposes guarded `/api/open` behavior for `explorer` and `code` targets.
- 2026-04-28: Viewer README documents that open actions are guarded and that the viewer remains read-only.
- 2026-04-28: Marked done after operator confirmation.
