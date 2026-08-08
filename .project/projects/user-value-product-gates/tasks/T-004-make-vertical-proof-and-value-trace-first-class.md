---
id: T-004
name: Make vertical proof and value trace first-class
status: planned
workstream: WS-B
created: 2026-08-08T20:17:16Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.project/templates/plan.md, .project/templates/task.md, .project/templates/workstream.md, .agents/schemas/artifacts/**]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-003
acceptance_criteria_ids: [AC-003, AC-004]
---

# Task: Make vertical proof and value trace first-class

## Description

Extend planning, workstream, and task contracts so meaningful product delivery begins with a representative vertical proof and every slice has an explicit relationship to executable demo capability.

## Acceptance Criteria

- [ ] Product/mixed plans require the smallest job-critical state-action-result loop, its first human product-shape review, foundation proportionality, named value-risk boundaries with expected critical steps, and the environment/data needed to execute each demo step.
- [ ] Workstreams declare the job-critical/supporting demo progress expected at handoff and the checkpoint that must resolve before downstream work starts.
- [ ] Demo steps are tagged `job-critical` or `supporting`; tasks declare stable demo-step IDs and exactly one bounded value role: `vertical-proof`, `enablement`, `product-quality`, or `adoption`.
- [ ] Breakdown/readiness checks reject broad enablement sequencing before the human-reviewed job-critical vertical proof unless it is the narrow prerequisite needed to make that proof executable and the plan records the proportionality decision.
- [ ] Task completion, tests, schema conformance, cosmetics, screenshots, or evidence volume alone cannot mark a demo step working; only representative execution evidence can, and supporting steps cannot satisfy expected critical steps.
- [ ] Templates, schemas, planning/breakdown assets, dependency fixtures, and CLI creation/inheritance tests agree and remain acyclic.

## Traceability
- Story: US-003
- Acceptance criteria: AC-003, AC-004

## Technical Notes

Reuse existing story/acceptance traceability rather than create a parallel task graph. Infrastructure plans still identify the first felt-value boundary but may use technical proof instead of pretending to have a product vertical slice.

## Definition of Done
- [ ] Plan/workstream/task contracts complete
- [ ] Sequencing and traceability checks pass
- [ ] Review confirms enablement cannot increment demo progress
- [ ] Stable interfaces handed to T-005 and T-007

## Evidence Log
- 2026-08-08T20:17:16Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
