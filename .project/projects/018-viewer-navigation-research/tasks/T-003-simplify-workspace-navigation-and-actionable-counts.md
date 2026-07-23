---
id: T-003
name: Simplify Workspace navigation and actionable counts
status: done
workstream: WS-A
created: 2026-07-13T17:57:31Z
updated: 2026-07-13T18:12:51Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.delano/viewer/ui/src/lib/domain/navigation.ts, .delano/viewer/ui/src/lib/domain/workspace-model.ts, .delano/viewer/ui/src/components/organisms/Sidebar.tsx, .delano/viewer/ui/src/pages/WorkspacePage.tsx]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-005, AC-006, AC-007]
---

# Task: Simplify Workspace navigation and actionable counts

## Description

Reduce Workspace navigation to the requested six ordered entries and change Tasks and Annotations badges from total counts to actionable open counts without changing their underlying table datasets.

## Acceptance Criteria

- [x] Workspace renders exactly Projects, Tasks, Context pack, Annotations, Warnings, and Blockers in that order; Workspace Progress and Validation are absent.
- [x] Tasks badge counts planned, ready, in-progress, and blocked tasks while excluding done and deferred; the Tasks table still lists all statuses.
- [x] Annotations badge equals `annotationSummary.open`; the table remains available for non-deleted historical annotations.
- [x] Focused domain/component checks verify ordering, icons, removed entries, and representative count fixtures.

## Traceability

- Story: US-003
- Acceptance criteria: AC-005 AC-006 AC-007

## Technical Notes

- Add one canonical open-task predicate; do not reuse `statusTone`, which treats deferred as open.
- Preserve Warnings and Blockers behavior.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T18:12:51Z: Domain fixtures verify exact six-entry order, four open task statuses, done/deferred exclusion, and annotationSummary.open; four component source checks and viewer build/type-check passed.

- 2026-07-13T18:10:30Z: Applying six-entry Workspace navigation and actionable count semantics.

- 2026-07-13T18:10:29Z: Research route dependency is done and Workspace ordering/count requirements are explicit.
- 2026-07-13T17:57:31Z: Created from .project/templates/task.md by `delano task add`.
