---
id: T-006
name: Promote workstreams and open tasks
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

# Task: Promote workstreams and open tasks

## Description

Make workstreams and open tasks more prominent in the project overview while reducing duplicated task presentation on workstream detail pages.

## Acceptance Criteria
- [x] Project overview prominently shows workstreams and incomplete tasks near the top of the page.
- [x] Open or incomplete tasks are visually prioritized over progress updates.
- [x] Workstream detail pages show tasks in the main task area and do not duplicate the same task list in the right metadata rail.
- [x] Existing navigation to workstreams, tasks, and source contracts remains intact.

## Technical Notes

- Treat tasks and workstreams as primary delivery objects, not secondary metadata.
- Remove duplication before adding new panels or summaries.
- This task comes from viewer feedback issue 4.

## Definition of Done
- [x] Implementation complete
- [x] Browser smoke test covers project overview and workstream detail
- [x] Review complete
- [x] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
- 2026-05-11T15:25:00Z: Promoted Workstreams and Open tasks into the selected-project Overview before Warnings, Progress, and Validation. Browser smoke at `http://127.0.0.1:3978/` confirmed Overview shows `Workstreams 1` and `Open tasks 6`; opening the workstream showed the main Tasks block and a right rail with Details and Task summary only, with no duplicate side task list. Console errors: 0.
