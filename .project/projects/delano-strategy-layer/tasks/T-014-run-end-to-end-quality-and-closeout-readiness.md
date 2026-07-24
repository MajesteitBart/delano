---
id: T-014
name: Run end-to-end quality and closeout readiness
status: planned
workstream: WS-D
created: 2026-07-24T00:59:25Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-012, T-013]
conflicts_with: [release-gates, .project/projects/delano-strategy-layer/updates/**, .project/projects/delano-strategy-layer/closeout.md]
parallel: false
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-001,US-002,US-003,US-004,US-005,US-006,US-007
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012]
---

# Task: Run end-to-end quality and closeout readiness

## Description

Exercise the complete optional-adoption, contract, promotion, board, mutation, live-update, packaging, and documentation flow; record release evidence and a closeout-readiness verdict without closing unmet work.

## Acceptance Criteria

- [ ] Fresh temporary repositories pass with no strategy artifacts and after `roadmap init`, item creation, project promotion, project execution fixtures, and evidence-gated item closure.
- [ ] Negative end-to-end fixtures fail for missing references, invalid lifecycle combinations, stale viewer hashes, terminal promotion, missing closure evidence, and non-terminal linked projects.
- [ ] Focused CLI/validator/viewer tests, viewer typecheck/lint/build, full `npm test`, package-manifest checks, mirror parity, `delano validate --release`, and package dry-run pass.
- [ ] Delegated browser smoke checks verify empty, mixed-lane, archive, stale, move, promotion, conflict, optional handover, live refresh, desktop, and narrow states.
- [ ] Every AC-001 through AC-012 has a repository-relative evidence pointer in a task log or project update.
- [ ] The final readiness report compares delivered behavior with all success metrics and non-goals and names any residual risk or skipped check.
- [ ] Working-tree status is inspected; unrelated/user-owned changes are preserved and reported; no commit, push, public action, or tracker mutation occurs without explicit authorization.

## Traceability
- Story: US-001,US-002,US-003,US-004,US-005,US-006,US-007
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012

## Technical Notes

Follow `quality-skill` and `closeout-skill` when this task is executed. Browser/GUI work must use the repository’s Codex CLI delegation rule rather than a spawned browser subagent.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Release evidence and handoff updated

## Evidence Log
- 2026-07-24T00:59:25Z: Created from .project/templates/task.md by `delano task add`.
