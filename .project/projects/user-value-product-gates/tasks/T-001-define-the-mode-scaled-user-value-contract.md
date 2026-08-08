---
id: T-001
name: Define the mode-scaled user-value contract
status: planned
workstream: WS-A
created: 2026-08-08T20:17:16Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [.agents/schemas/**, .project/templates/spec.md, .agents/rules/delivery-modes.md]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-001,US-002
acceptance_criteria_ids: [AC-001, AC-002]
---

# Task: Define the mode-scaled user-value contract

## Description

Define the versioned canonical fields, sections, classifications, surface profiles, and invariants that make upstream intent, the named user/job, observable capability, explicit non-capabilities, representative demo, and first felt-value boundary unavoidable for meaningful projects.

## Acceptance Criteria

- [ ] New Mode 2 through 4 spec contracts require a value-contract version, `product|infrastructure|mixed` classification, `none|ui|cli|api|workflow|mixed` human-facing surface profile, upstream intent, named user/job, observable capability, explicit non-capabilities, stable demo steps, and first felt-value boundary.
- [ ] Product/mixed and infrastructure branches have separate, explicit obligations; neither classification can omit an owner/reviewer decision or claim unsupported payoff.
- [ ] Modes 0 and 1 require no new standalone artifact or full product contract for genuinely bounded work; the canonical mode rule requires escalation for new multi-step capability, coordinated task sets, material uncertainty, or cross-surface change, and terminal history remains outside retroactive strictness.
- [ ] The canonical rule rejects classification/surface contradictions and downward redefinition of an essential upstream job unless an owner approves the outcome change or honest infrastructure reclassification; keywords, line/file/task counts, screenshots, and automated test volume cannot satisfy user-value acceptance.
- [ ] Spec schema, artifact scope, operating-mode surface, template, handbook rule, and valid/invalid fixtures agree on fields, sections, enums, and failure messages.
- [ ] Focused checks reject missing, contradictory, or malformed classifications and report only repository-relative paths.

## Traceability
- Story: US-001,US-002
- Acceptance criteria: AC-001, AC-002

## Technical Notes

Use an explicit contract version for adoption rather than creation dates. Keep demo step IDs stable and human-readable. Do not choose the activation/checkpoint receipt storage before the required probe resolves OD-005.

## Definition of Done
- [ ] Contract/schema/template implementation complete
- [ ] Focused valid/invalid fixtures pass
- [ ] Review confirms both product and infrastructure branches are honest
- [ ] Canonical rule and migration impact documented for T-011

## Evidence Log
- 2026-08-08T20:17:16Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
