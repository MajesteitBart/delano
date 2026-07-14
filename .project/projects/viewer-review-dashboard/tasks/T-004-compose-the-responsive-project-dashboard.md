---
id: T-004
name: Compose the responsive project dashboard
status: done
workstream: WS-A
created: 2026-07-13T21:59:58Z
updated: 2026-07-13T22:17:40Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-006, AC-007, AC-008]
---

# Task: Compose the responsive project dashboard

## Description

Replace the project overview metric-card/file-table inventory with a responsive Local Dossier dashboard: compact project summary, task-state execution map, spec brief, workstream progress, and recent evidence with direct source navigation.

## Acceptance Criteria
- [x] The all-files table and four-card metric grid are absent from project overview.
- [x] Project status, updated time, current task-state distribution, spec brief, workstreams, and recent evidence are visible and source-linked.
- [x] Active, completed, empty, and single-workstream projects use meaningful labels and empty states.
- [x] The dashboard uses flat section hierarchy without nested cards, ornamental gradients, or ungrounded metrics.
- [x] Narrow viewports remain readable without page-level horizontal overflow and interactive elements are keyboard accessible.

## Traceability
- Story: US-004
- Acceptance criteria: AC-006, AC-007, AC-008

## Technical Notes

Follow the repository’s Local Dossier tokens and existing semantic routes. Use a segmented current-state bar/list rather than a misleading trend line.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs impact completed in T-005

## Evidence Log

- 2026-07-13T22:17:40Z: npm run test:dashboard 3/3 passed; domain/typecheck/targeted ESLint/build passed; T3 active project showed 60% complete, 2 open, 0 blocked, 1 workstream, three truthful state segments, four required sections, no table, no overflow; completed project showed 100%, zero open, one done segment, and 'All tasks complete'; Open spec drilldown reached the reader.

- 2026-07-13T22:10:53Z: Composing responsive Local Dossier project dashboard from tested model.

- 2026-07-13T22:10:53Z: Dependency T-003 complete; dashboard model is stable and source navigation callbacks already exist.
- 2026-07-13T21:59:58Z: Created from .project/templates/task.md by `delano task add`.
