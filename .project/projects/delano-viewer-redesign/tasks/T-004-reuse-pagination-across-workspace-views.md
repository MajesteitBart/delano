---
id: T-004
name: Reuse pagination across workspace views
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
priority: medium
estimate: M
---

# Task: Reuse pagination across workspace views

## Description

Make workspace pagination consistent across progress, validation, warnings, and blockers so larger data sets use the same navigation affordance.

## Acceptance Criteria
- [ ] Progress, validation, warnings, and blockers workspace views use the same pagination component or helper.
- [ ] Pagination appears when a view exceeds the configured page size and is hidden for short lists.
- [ ] Switching workspace views resets to a valid page and never renders an empty page when data exists.
- [ ] Pagination state remains readable and keyboard-accessible.

## Technical Notes

- Extract shared pagination behavior from the current progress view instead of duplicating inline logic.
- Keep page size and labels consistent unless a view has a clear reason to differ.
- This task comes from viewer feedback issue 2.

## Definition of Done
- [ ] Implementation complete
- [ ] Browser smoke test covers all paginated workspace views
- [ ] Review complete
- [ ] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
