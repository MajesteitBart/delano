---
id: T-002
name: Ship boil-it-down and the activation review
status: planned
workstream: WS-A
created: 2026-08-08T20:17:16Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.agents/skills/boil-it-down/**, .agents/skills/discovery-skill/**, .agents/skills/planning-skill/**]
parallel: true
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-001,US-002
acceptance_criteria_ids: [AC-001, AC-002, AC-009]
---

# Task: Ship boil-it-down and the activation review

## Description

Add a short, confrontational skill that forces the value contract and smallest credible demo into canonical scope, exposes honest infrastructure, and stops activation when the job/payoff is not credible.

## Acceptance Criteria

- [ ] `boil-it-down` defines Delano-standard triggers, inputs, outputs, quality checks, failure behavior, side effects, hooks, a runbook, and at least two concise templates.
- [ ] Before activation it compares upstream intent with the named user/job, literal demo, smallest version, non-capabilities, classification/surface profile, and infrastructure boundary, then edits or stops the spec/plan rather than generating a parallel payoff report.
- [ ] At re-boil and closeout it delegates to the same stable demo steps and lifecycle decisions instead of inventing a new rubric.
- [ ] Failure cannot be resolved by redefining the job downward, setting `surface: none` against visible touchpoints, adding prose, substituting words, attaching screenshots, or self-issuing human approval; the skill stops and asks for the applicable owner decision.
- [ ] Discovery and planning guidance invoke the skill for new modes 2 through 4 while preserving light Mode 0/1 workflows.
- [ ] Behavioral fixtures cover Kotlin product activation, honest infrastructure disclosure, and a valid product case; expressing concern and then continuing does not count as a pass.

## Traceability
- Story: US-001,US-002
- Acceptance criteria: AC-001, AC-002, AC-009

## Technical Notes

Follow the terse, action-oriented pattern observed in the public inspiration without copying its wording. The skill should modify canonical decisions and remove/reshape unjustified scope, but it must not delete historical evidence automatically.

## Definition of Done
- [ ] Skill and execution assets complete
- [ ] Behavioral and contract checks pass
- [ ] Review confirms concise stop behavior and no parallel artifact
- [ ] Integration impact handed to T-003 and T-011

## Evidence Log
- 2026-08-08T20:17:16Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
