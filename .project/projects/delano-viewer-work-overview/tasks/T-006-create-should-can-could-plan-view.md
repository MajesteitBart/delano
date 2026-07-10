---
id: T-006
name: Create Should Can Could Plan view
status: planned
workstream: WS-C
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-003]
conflicts_with: [.delano/viewer/ui/src/pages/PlanPage.tsx]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-005]
---

# Task: Create Should Can Could Plan view

## Description

Build a look-ahead page over canonical task states and dependencies with mutually exclusive Should, Can, Could, and Waiting groups, visible definitions, and deterministic ranking.

## Acceptance Criteria

- [ ] In-progress, safe ready, planned, blocked, unmet-dependency, done, and deferred fixtures appear in exactly the category defined by the spec
- [ ] Should recommendations, Can queue, Could candidates, and Waiting reasons are understandable and link to canonical task/project documents
- [ ] Search, project/workstream/priority filters, sorting, empty states, and pagination use shared behavior and match the approved design

## Traceability
- Story: US-003
- Acceptance criteria: AC-005

## Technical Notes

- Mutually exclusive categories: Should = all in-progress plus up to three top-ranked dependency-safe ready tasks; Can = remaining dependency-safe ready; Could = dependency-satisfied planned; Waiting = blocked or unmet dependency. Exclude done/deferred.
- Rank ready recommendations by active status, priority, project/task natural ID, then stable path. Do not use freshness as a proxy for priority.
- Show canonical status separately from the derived category and provide short definitions in the page.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
