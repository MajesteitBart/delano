---
id: T-006
name: Enable guarded branch-local apply and checkout-neutral validation
status: done
workstream: WS-B
created: 2026-07-14T16:49:29Z
updated: 2026-07-16T20:57:49Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-003]
conflicts_with: [.agents/scripts/pm/validate.sh]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-003, AC-010, AC-011]
---

# Task: Enable guarded branch-local apply and checkout-neutral validation

## Description

Permit guarded canonical Markdown apply in any fresh selected worktree and replace linked-only dirty-state rejection with consistent normal and release validation semantics.

## Acceptance Criteria

- [x] Apply in primary and linked worktrees requires identical containment, explicit confirmation, expected hash, capability, and fresh-context checks.
- [x] Normal validation checks contract validity and reports dirty provenance consistently without failing solely because the checkout is linked.
- [x] Release validation enforces one cleanliness policy for both checkout roles and documents any explicit override.
- [x] CLI help, validation fixtures, and tests cover dirty primary, dirty linked, clean primary, clean linked, and stale apply behavior.
- [x] No rule attempts to infer a canonical branch name.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001, AC-003, AC-010, AC-011

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-16T20:57:49Z: Focused CLI validation policy test passed; focused selected-linked guarded apply test passed.

- 2026-07-16T20:55:09Z: Implement guarded branch-local apply and checkout-neutral normal/release validation semantics.

- 2026-07-16T20:55:08Z: Readiness review passed: T-002 and T-003 are done; selected-context capabilities and review backend are available.
- 2026-07-14T16:49:29Z: Created from .project/templates/task.md by `delano task add`.
