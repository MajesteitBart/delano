---
id: T-003
name: Enforce roadmap and traceability validation
status: done
workstream: WS-A
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T06:48:54Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.agents/scripts/pm/validate.sh, scripts/check-roadmap-contracts.mjs, .agents/schemas/artifact-scope.json]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-004
acceptance_criteria_ids: [AC-005, AC-010, AC-011]
---

# Task: Enforce roadmap and traceability validation

## Description

Wire roadmap item, lifecycle, closure, and optional project-reference checks into `delano validate` with opt-in behavior and path-specific errors.

## Acceptance Criteria

- [x] A repository with no roadmap directory and no `roadmap_item` references passes without a roadmap warning.
- [x] Validation rejects invalid item filenames/IDs, missing required fields/sections, invalid enums, mutable `created`, and disallowed active/horizon combinations.
- [x] Validation rejects a project `roadmap_item` reference that does not resolve to exactly one item.
- [x] Validation rejects `active` items without `horizon: now` or an active linked project.
- [x] Validation rejects `done` items without closure evidence, without a complete linked project, or with any non-terminal linked project.
- [x] Fixture coverage includes valid opt-in, legacy no-opt-in, one-to-many promotion, and every negative rule above.
- [x] Errors name the affected repository-relative artifact and violated rule without leaking local absolute paths.

## Traceability
- Story: US-004
- Acceptance criteria: AC-005, AC-010, AC-011

## Technical Notes

Use one roadmap/project scan and reuse the projection/link parser from T-004 where practical. Keep staleness advisory out of validation. Update hardcoded artifact-kind lists and schema coverage deliberately.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Rule/validator documentation updated

## Evidence Log

- 2026-07-24T06:48:54Z: Quality evidence: roadmap tests passed 9/9 in .agents/logs/tests/20260724T064758Z.log; direction-context tests passed 3/3 in .agents/logs/tests/20260724T064800Z.log; contract validation passed all WS-A checks and failed only deferred Claude mirror parity in .agents/logs/tests/20260724T064804Z.log.

- 2026-07-24T06:47:18Z: Roadmap checker, spec reference schema, validate.sh wiring, and 16-case fixture matrix implemented; focused WS-A tests passed 12/12 plus 3 context tests. npm test passed 142/144; only generated payload fixtures await WS-D manifest integration.

- 2026-07-24T06:41:27Z: Wire opt-in roadmap and project traceability validation

- 2026-07-24T06:41:27Z: T-001 dependency is done and T-004 parser/projection boundary is available
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
