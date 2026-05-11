---
id: T-007
name: Add projects dashboard start page
status: blocked
workstream: WS-A
created: 2026-05-11T09:52:00Z
updated: 2026-05-11T09:52:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: false
priority: high
estimate: L
blocked_owner: bart
blocked_check_back: 2026-05-12
---

# Task: Add projects dashboard start page

## Description

Add a workspace dashboard that gives a quick glance across all current projects and can serve as the default starting page when no saved navigation state exists.

## Acceptance Criteria
- [ ] Workspace menu includes a projects dashboard page.
- [ ] Dashboard shows all current projects with status, created date, updated date, and counts for tasks, workstreams, and related assets.
- [ ] Dashboard uses a scannable card or grid layout suitable for comparing projects at a glance.
- [ ] New-session fallback from navigation persistence opens this dashboard when no stored route is available.

## Technical Notes

- Build on the existing project index data before adding new server endpoints.
- Keep the dashboard read-only and consistent with the viewer design language.
- This task comes from viewer feedback issue 5.

## Definition of Done
- [ ] Implementation complete
- [ ] Browser smoke test covers dashboard navigation and project opening
- [ ] Review complete
- [ ] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
