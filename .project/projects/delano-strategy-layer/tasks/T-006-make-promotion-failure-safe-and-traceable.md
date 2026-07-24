---
id: T-006
name: Make promotion failure safe and traceable
status: planned
workstream: WS-B
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T01:03:35Z
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

- [ ] Promotion rejects missing or terminal source items before creating a target directory.
- [ ] Successful promotion creates the normal planned spec/plan/decisions dossier and writes exactly one `roadmap_item: RM-###` reference to the project spec.
- [ ] The source roadmap item hash is identical before and after successful promotion.
- [ ] The same item can promote to multiple distinct project slugs, and the projection derives every resulting project.
- [ ] A pre-existing target slug is rejected without modifying the target or source item.
- [ ] An injected failure after creation begins leaves no partial newly created project directory and never removes a pre-existing path.
- [ ] CLI tests verify custom/default project inputs, JSON output naming the created spec, terminal rejection, repeated promotion, collision, and cleanup.

## Traceability
- Story: US-003
- Acceptance criteria: AC-004, AC-010, AC-011

## Technical Notes

Prefer staging/atomic rename or a narrowly guarded rollback owned by `createProjectFromTemplates`. Do not copy strategic prose into the project; the reference plus discovery/handover guidance keeps the source current without snapshot drift.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Promotion semantics documented for T-013

## Evidence Log
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
