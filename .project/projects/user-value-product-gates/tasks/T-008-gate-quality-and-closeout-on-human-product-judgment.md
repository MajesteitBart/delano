---
id: T-008
name: Gate quality and closeout on human product judgment
status: planned
workstream: WS-C
created: 2026-08-08T20:17:17Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005, T-007]
conflicts_with: [.agents/skills/quality-skill/**, .agents/skills/closeout-skill/**, src/cli/commands/state.js, .project/templates/completion-summary.md]
parallel: false
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-004,US-005
acceptance_criteria_ids: [AC-007, AC-008, AC-009]
---

# Task: Gate quality and closeout on human product judgment

## Description

Integrate representative demo and product-review evidence into quality, closeout, project close, and automatic parent rollups so product failure cannot be closed around while infrastructure retains an honest path.

## Acceptance Criteria

- [ ] Quality and closeout skills require the applicable current product-review or infrastructure evidence before issuing a passing gate decision.
- [ ] Any failed representative demo step, missing human review, unresolved critical product finding, stale evidence, or mismatch with the current value contract blocks product/mixed closure.
- [ ] Passing accessibility, performance, integration, test, screenshot, or evidence-volume checks remain visible but cannot substitute for failed intended-job or human-product evidence.
- [ ] Infrastructure closure verifies its promised technical capability and restates the first felt-value boundary and current downstream status without claiming product acceptance.
- [ ] `delano project close`, final task close/defer rollup, direct contract validation, and Viewer-triggered lifecycle paths use the same precondition and fail without writes.
- [ ] Completion summaries compare target job, actual demonstrated capability, explicit non-capabilities, human findings, invisible engineering retained, and follow-up decisions.
- [ ] Focused tests cover Kotlin, cosmetic Kotlin, screenshots-only, tests-only, stale review, critical finding, passing product, passing infrastructure, and closeout retry.

## Traceability
- Story: US-004,US-005
- Acceptance criteria: AC-007, AC-008, AC-009

## Technical Notes

Closeout must happen before parent lifecycle becomes complete/done. Preserve unfinished value state rather than rolling back technical task evidence. Keep learning proposals separate from the product-pass decision.

## Definition of Done
- [ ] Quality/closeout/lifecycle integration complete
- [ ] All mutation-path and negative tests pass
- [ ] Review demonstrates automated evidence cannot override product failure
- [ ] Stable closeout semantics handed to T-009/T-011

## Evidence Log
- 2026-08-08T20:17:17Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
