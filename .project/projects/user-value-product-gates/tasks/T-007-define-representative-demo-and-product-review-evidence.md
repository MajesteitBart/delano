---
id: T-007
name: Define representative demo and product-review evidence
status: planned
workstream: WS-C
created: 2026-08-08T20:17:17Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-004]
conflicts_with: [.agents/schemas/artifacts/**, .agents/skills/quality-skill/**, .project/templates/**]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-005
acceptance_criteria_ids: [AC-007, AC-008]
---

# Task: Define representative demo and product-review evidence

## Description

Define the smallest current evidence contract that proves the literal job/demo was exercised on representative data and captures accountable human product-quality judgment without pretending screenshots or checklists are taste.

## Acceptance Criteria

- [ ] A product-review record supports an early vertical-proof review and final closeout review, and binds the value contract/demo content, tested build or artifact, representative data description, each demo-step result, timestamp, and named human reviewer.
- [ ] Representative data requirements are explicit enough to exercise the realistic volume, states, context, and failure modes named by the spec; sample labels alone are insufficient.
- [ ] Early review judges the job-critical state-action-result loop plus information hierarchy, copy, contextual actions, data usefulness, interaction feedback, and relevant empty/loading/error states; final review covers the complete intended job without a universal numeric score.
- [ ] The implementing agent cannot self-approve a required human field; unavailable human review produces a blocker and the contract clearly distinguishes accountable provenance from authenticated identity.
- [ ] Screenshots, recordings, accessibility, performance, integration, and automated test results can be linked as supporting evidence but cannot override a failed step or critical human finding.
- [ ] Infrastructure has a separate evidence branch for the technical promise and first felt-value boundary; it does not fabricate product-demo fields or a product-pass decision.
- [ ] Schema/template/quality assets plus current/stale/missing/invalid/privacy fixtures agree and use only repository-relative references.

## Traceability
- Story: US-005
- Acceptance criteria: AC-007, AC-008

## Technical Notes

Prefer a typed use of existing project updates or another probe-approved compact record. Do not overload published source-text reviews, which are bound to Markdown rather than a running build/data set.

## Definition of Done
- [ ] Evidence contract and templates complete
- [ ] Freshness, human-field, and supporting-evidence tests pass
- [ ] Human review confirms the rubric prompts judgment rather than scoring theater
- [ ] Closure interface handed to T-008

## Evidence Log
- 2026-08-08T20:17:17Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
