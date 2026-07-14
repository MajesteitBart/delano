---
id: T-004
name: Add datetime range filters and presets
status: done
workstream: WS-A
created: 2026-07-13T20:18:45Z
updated: 2026-07-13T20:45:05Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: [.delano/viewer/ui/package.json, .delano/viewer/ui/package-lock.json, .delano/viewer/ui/src/components/**, .delano/viewer/ui/src/lib/**, .delano/viewer/ui/src/pages/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-007]
---

# Task: Add datetime range filters and presets

## Description

Add the shadcn Calendar source component and a reusable inclusive date-range filter with historical presets for Updated and Created columns.

## Acceptance Criteria
- [x] Updated and Created filters offer Today, Last 7 days, Last 30 days, This year, and Custom range.
- [x] Presets and custom ranges filter inclusively through the local end-of-day.
- [x] Invalid or missing timestamps do not match an active date range and do not crash rendering.
- [x] The active range is summarized and can be cleared.

## Traceability
- Story: US-003
- Acceptance criteria: AC-007

## Technical Notes

- Add Calendar through `npx shadcn@latest add calendar`, then review generated code.
- Follow shadcn range-calendar composition while adapting presets to historical review workflows.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T20:45:05Z: Domain fixtures verify inclusive local end-of-day and invalid dates; 7 source checks, typecheck, build, and T3 Today preset smoke passed with active summary and clear control.

- 2026-07-13T20:33:40Z: Calendar dependencies and range-filter extension points are available.

- 2026-07-13T20:33:39Z: T-003 is done and datetime filtering is dependency-safe.
- 2026-07-13T20:18:45Z: Created from .project/templates/task.md by `delano task add`.
