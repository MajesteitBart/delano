---
id: T-007
name: Add projects dashboard start page
status: done
workstream: WS-A
created: 2026-05-11T09:52:00Z
updated: 2026-05-11T15:25:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: false
priority: high
estimate: L
---

# Task: Add projects dashboard start page

## Description

Add a workspace dashboard that gives a quick glance across all current projects and can serve as the default starting page when no saved navigation state exists.

## Acceptance Criteria
- [x] Workspace menu includes a projects dashboard page.
- [x] Dashboard shows all current projects with status, created date, updated date, and counts for tasks, workstreams, and related assets.
- [x] Dashboard uses a scannable card or grid layout suitable for comparing projects at a glance.
- [x] New-session fallback from navigation persistence opens this dashboard when no stored route is available.

## Technical Notes

- Build on the existing project index data before adding new server endpoints.
- Keep the dashboard read-only and consistent with the viewer design language.
- This task comes from viewer feedback issue 5.

## Definition of Done
- [x] Implementation complete
- [x] Browser smoke test covers dashboard navigation and project opening
- [x] Review complete
- [x] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
- 2026-05-11T15:25:00Z: Added the workspace Projects dashboard as the first global sidebar route. Browser smoke at `http://127.0.0.1:3978/` cleared stored navigation and confirmed the default title is `Projects`, the sidebar count is 11, and project cards show status, created date, updated date, workstreams, open tasks, total tasks, and assets. Console errors: 0.
