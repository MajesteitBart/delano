---
id: T-008
name: Integrate routes navigation and responsive behavior
status: planned
workstream: WS-D
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-004 T-005 T-006 T-007]
conflicts_with: [.delano/viewer/ui/src/app/**, .delano/viewer/ui/src/components/organisms/Sidebar.tsx, .delano/viewer/ui/src/pages/WorkspacePage.tsx, .delano/viewer/ui/src/pages/ProjectPages.tsx, .delano/viewer/ui/src/index.css]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-005
acceptance_criteria_ids: [AC-001, AC-002, AC-006]
---

# Task: Integrate routes navigation and responsive behavior

## Description

Integrate Home, Review, Plan, and Updated Files into the existing shell, make Home the safe default, preserve valid navigation state, apply shared table controls to all legacy tables, and polish responsive/accessibility behavior.

## Acceptance Criteria

- [ ] New routes and sidebar counts work, Home is the default, valid saved/deep routes restore, and project selection/reader routes remain functional
- [ ] Every legacy workspace/project table now satisfies the shared search/filter/sort/result/reset/pagination contract
- [ ] Keyboard focus, labels, compact sidebar, tablet/mobile layouts, horizontal table containment, and current reader/editor flows pass targeted checks

## Traceability
- Story: US-005
- Acceptance criteria: AC-001 AC-002 AC-006

## Technical Notes

- Add workspace routes without changing project/document route meanings. Invalid or stale saved routes fall back to Home.
- Apply shared controls to Project, Open work, Progress, Annotations, Validation, Warnings, Blockers, project source docs, workstreams, and tasks with table-appropriate fields.
- Preserve compact Sheet navigation, topbar actions, document restoration, and route-local search parameters.
- Dense tables can scroll inside their card/surface; the overall page must not acquire horizontal overflow.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
