---
id: T-005
name: Implement re-boil and stop-loss lifecycle guards
status: planned
workstream: WS-B
created: 2026-08-08T20:17:16Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-004]
conflicts_with: [src/cli/commands/state.js, src/cli/lib/project-state.js, .agents/scripts/pm/**, .agents/skills/execution-skill/**]
parallel: false
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-004
acceptance_criteria_ids: [AC-005, AC-006]
---

# Task: Implement re-boil and stop-loss lifecycle guards

## Description

Implement current, evidence-backed `continue|reshape-required|stop` checkpoints and make unresolved value drift a real task/workstream lifecycle blocker with immediate stop authority.

## Acceptance Criteria

- [ ] A concise checkpoint record compares working representative demo steps with the prior checkpoint and the boundary's expected critical steps, names observed evidence, and records exactly one `continue`, `reshape-required`, or `stop` decision.
- [ ] Declared value-risk boundaries and workstream handoffs require a current checkpoint; any executor/supervisor may also trigger an immediate stop when approved scope cannot deliver the intended job.
- [ ] Material enablement that leaves the expected job-critical step non-working yields `reshape-required` or `stop`; a newly working supporting step or concern text plus continued execution cannot produce `continue`.
- [ ] Task/workstream start rejects stale, missing, `reshape-required`, or `stop` state for unrelated work and leaves contracts unchanged; only explicitly scoped recovery/reshape actions may proceed.
- [ ] Owner resolution records the chosen continue/reshape/stop action, updates affected canonical scope when needed, and invalidates superseded approvals/checkpoints.
- [ ] The mechanism uses plan-declared boundaries rather than fixed task, hour, file, or update counts and passes CLI/direct-validation/parent-rollup negative tests.

## Traceability
- Story: US-004
- Acceptance criteria: AC-005, AC-006

## Technical Notes

Keep checkpoint storage small and single-source per the probe result. Extend existing blocker reporting where possible rather than add a new project lifecycle status. Preserve all completed infrastructure evidence when stopping.

## Definition of Done
- [ ] Checkpoint comparison and lifecycle guards complete
- [ ] Stale/no-progress/no-write tests pass
- [ ] Review demonstrates immediate and scheduled stop paths
- [ ] Projection and closeout interfaces handed to T-006/T-008

## Evidence Log
- 2026-08-08T20:17:16Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
