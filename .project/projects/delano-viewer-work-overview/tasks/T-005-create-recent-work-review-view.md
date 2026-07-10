---
id: T-005
name: Create recent work Review view
status: planned
workstream: WS-C
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002 T-003]
conflicts_with: [.delano/viewer/ui/src/pages/ReviewPage.tsx]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-004]
---

# Task: Create recent work Review view

## Description

Build a review queue over recently done tasks, acceptance/evidence health, and actual committed file context; reuse the existing review handover without adding lifecycle state.

## Acceptance Criteria

- [ ] Review lists recently done tasks with project/workstream, completion time, checked acceptance count, evidence presence, and clear review action
- [ ] Actual file/commit context is inspectable without claiming unproven task-to-commit linkage
- [ ] Search, filters, sorting, time range, pagination, empty states, and existing review handover work per the approved design

## Traceability
- Story: US-002
- Acceptance criteria: AC-004

## Technical Notes

- Review is an operator queue over `done` tasks and recent commits/files, not a new status. Use evidence completeness and existing checked sections as signals only.
- Reuse `HandoverMenu` review intent for task/workstream checks. Any annotations remain in the existing annotation store.
- Keep task and file/commit context visually adjacent but do not claim linkage unless an exact contract field, PR, or commit reference exists.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
