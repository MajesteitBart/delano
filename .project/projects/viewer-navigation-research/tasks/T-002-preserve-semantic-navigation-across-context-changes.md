---
id: T-002
name: Preserve semantic navigation across context changes
status: done
workstream: WS-A
created: 2026-07-13T17:57:31Z
updated: 2026-07-13T18:10:05Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.delano/viewer/ui/src/lib/domain/navigation.ts, .delano/viewer/ui/src/app/useViewerNavigation.ts]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-002, AC-003, AC-004]
---

# Task: Preserve semantic navigation across context changes

## Description

Replace project/context default-route resets with a deterministic translator that preserves exact routes or maps them to the closest valid semantic destination in the new project or index.

## Acceptance Criteria

- [x] Selecting a project leaves Workspace routes unchanged and retains equivalent project overview, workstreams, tasks, research, or progress routes.
- [x] Document routes retain an exact available path, map spec/plan/decision roles to the target project, and map task/workstream/research/progress roles to their closest collection route when exact paths are unavailable.
- [x] Repository/worktree generation changes validate every retained path against the new index and fall back deterministically without showing stale documents.
- [x] Versioned stored navigation migrates removed routes and domain fixtures cover exact, equivalent, and unavailable destinations.

## Traceability

- Story: US-002
- Acceptance criteria: AC-002 AC-003 AC-004

## Technical Notes

- Keep translation pure and separately tested; React effects should only coordinate state/ref updates.
- Preserve existing context generation isolation and write guards.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T18:10:05Z: Domain fixtures cover workspace retention, source-role translation, task/research collection fallback, exact context paths, unavailable projects, and legacy route migration; viewer build/type-check passed.

- 2026-07-13T18:04:26Z: Implementing pure project/context navigation translation and storage migration.

- 2026-07-13T18:04:25Z: T-001 dependency is done and semantic route acceptance fixtures are defined.
- 2026-07-13T17:57:31Z: Created from .project/templates/task.md by `delano task add`.
