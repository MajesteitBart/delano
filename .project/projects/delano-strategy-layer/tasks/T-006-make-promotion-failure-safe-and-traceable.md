---
id: T-006
name: Make promotion failure safe and traceable
status: done
workstream: WS-B
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T07:08:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005]
conflicts_with: [src/cli/lib/project-state.js, src/cli/lib/roadmap-state.js, .project/templates/spec.md, test/cli.test.js]
parallel: true
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-003
acceptance_criteria_ids: [AC-004, AC-010, AC-011]
---

# Task: Make promotion failure safe and traceable

## Description

Implement roadmap promotion as a failure-safe project creation operation that writes one authoritative roadmap reference, permits one-to-many promotion, and never mutates the source item.

## Acceptance Criteria

- [x] Promotion rejects missing or terminal source items before creating a target directory.
- [x] Successful promotion creates the normal planned spec/plan/decisions dossier and writes exactly one `roadmap_item: RM-###` reference to the project spec.
- [x] The source roadmap item hash is identical before and after successful promotion.
- [x] The same item can promote to multiple distinct project slugs, and the projection derives every resulting project.
- [x] A pre-existing target slug is rejected without modifying the target or source item.
- [x] An injected failure after creation begins leaves no partial newly created project directory and never removes a pre-existing path.
- [x] CLI tests verify custom/default project inputs, JSON output naming the created spec, terminal rejection, repeated promotion, collision, and cleanup.

## Traceability
- Story: US-003
- Acceptance criteria: AC-004, AC-010, AC-011

## Technical Notes

Prefer staging/atomic rename or a narrowly guarded rollback owned by `createProjectFromTemplates`. Do not copy strategic prose into the project; the reference plus discovery/handover guidance keeps the source current without snapshot drift.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Promotion semantics documented for T-013

## Evidence Log

- 2026-07-24T07:08:22Z: Quality logs: focused WS-B checks .agents/logs/tests/20260724T070653Z.log; full npm suite .agents/logs/tests/20260724T070715Z.log.

- 2026-07-24T07:08:22Z: Atomic staged creation, single spec reference, source-hash preservation, collision/terminal guards, repeated promotion, and injected cleanup verified; focused suite passed 68/68. Full npm test passed 151/153; remaining payload schema fixtures belong to T-012.

- 2026-07-24T07:03:42Z: Implement failure-safe roadmap promotion

- 2026-07-24T07:03:42Z: T-005 command/service dependency is done
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
