---
id: T-004
name: Reuse pagination across workspace views
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
priority: medium
estimate: M
---

# Task: Reuse pagination across workspace views

## Description

Make workspace pagination consistent across progress, validation, warnings, and blockers so larger data sets use the same navigation affordance.

## Acceptance Criteria
- [x] Progress, validation, warnings, and blockers workspace views use the same pagination component or helper.
- [x] Pagination appears when a view exceeds the configured page size and is hidden for short lists.
- [x] Switching workspace views resets to a valid page and never renders an empty page when data exists.
- [x] Pagination state remains readable and keyboard-accessible.

## Technical Notes

- Extract shared pagination behavior from the current progress view instead of duplicating inline logic.
- Keep page size and labels consistent unless a view has a clear reason to differ.
- This task comes from viewer feedback issue 2.

## Definition of Done
- [x] Implementation complete
- [x] Browser smoke test covers all paginated workspace views
- [x] Review complete
- [x] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
- 2026-05-11T15:25:00Z: Extracted shared workspace pagination helpers and component in `.delano/viewer/public/app.jsx`. Browser smoke at `http://127.0.0.1:3978/` confirmed Progress renders `Page 1 of 4`, Validation renders `Page 1 of 9`, Warnings with one row hides pagination, and Blockers with no rows shows the empty state without pagination. Console errors: 0.
