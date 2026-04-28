---
id: T-003
name: Process navigation and context filters
status: done
workstream: WS-B
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Process navigation and context filters

## Description

Make project navigation reflect Delano process by resetting filters across folder changes, hiding irrelevant status filters, exposing a right-side project outline, and making workstream/subtask navigation clear.

## Acceptance Criteria
- [x] Switching project or folder resets search, status, role, and workstream scope.
- [x] Status filters only render when the selected group contains statuses.
- [x] The right-side outline exposes project core documents, progress/decisions, workstreams, and tasks.
- [x] Selecting a workstream focuses the list and reveals subtasks.

## Technical Notes

- This task maps directly to the second user feedback pass from the original prototype conversation.
- The UX should optimize for process/progress navigation, not just document discovery.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Frontend state includes `project`, `query`, `status`, `role`, and `workstream`, with reset behavior on project switch.
- 2026-04-28: Frontend renders status filters conditionally and uses the right-side outline for workstreams and subtasks.
- 2026-04-28: Marked done after operator confirmation.
