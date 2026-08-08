---
id: T-006
name: Expose product-value supervision signals
status: planned
workstream: WS-B
created: 2026-08-08T20:17:17Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005]
conflicts_with: [.agents/scripts/pm/status.sh, .agents/scripts/pm/next.sh, .delano/viewer/**]
parallel: true
priority: medium
estimate: M
operating_mode: multi-stream
story_id: US-004
acceptance_criteria_ids: [AC-005, AC-006]
---

# Task: Expose product-value supervision signals

## Description

Make delivery classification, executable demo progress, current checkpoint decision, value blocker, and required human action visible in status/next-work output and the minimum Delano Viewer supervision surface.

## Acceptance Criteria

- [ ] Status output distinguishes task completion from working demo-step progress and shows classification, completed/total applicable demo steps, latest decision/freshness, and next required human action.
- [ ] Next-work selection excludes tasks blocked by value state and explains the value blocker separately from dependency or ownership blockers.
- [ ] The Viewer project surface exposes the same derived facts and links to the canonical spec/demo/checkpoint/review evidence without persisting a second projection.
- [ ] Missing, stale, `reshape-required`, and `stop` states are visible and cannot be visually confused with normal planned or blocked task counts.
- [ ] The minimum surface is keyboard accessible, understandable without color, usable at narrow width, and contains no percentage-complete or invented product-success claim.
- [ ] Focused status/selection/domain/component tests cover product, infrastructure, mixed, no-progress, stale, stopped, legacy, and Mode 0/1 cases.

## Traceability
- Story: US-004
- Acceptance criteria: AC-005, AC-006

## Technical Notes

Keep this a supervision projection, not a Viewer redesign. Reuse the shared domain result from T-005 and canonical source links. Do not turn task totals into progress bars.

## Definition of Done
- [ ] CLI/script and minimum Viewer projection complete
- [ ] Focused accessibility/domain/source tests pass
- [ ] Human review confirms blockers and actions are understandable
- [ ] Viewer build/package impact handed to T-011

## Evidence Log
- 2026-08-08T20:17:17Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
