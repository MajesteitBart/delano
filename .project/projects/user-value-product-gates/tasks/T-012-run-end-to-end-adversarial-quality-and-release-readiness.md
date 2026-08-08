---
id: T-012
name: Run end-to-end adversarial quality and release readiness
status: planned
workstream: WS-D
created: 2026-08-08T20:17:18Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-006, T-009, T-010, T-011]
conflicts_with: [release-gates, .project/projects/user-value-product-gates/updates/**, .project/projects/user-value-product-gates/closeout.md]
parallel: false
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-001,US-002,US-003,US-004,US-005,US-006
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012]
---

# Task: Run end-to-end adversarial quality and release readiness

## Description

Exercise the complete activation, vertical-proof, checkpoint, supervision, product/infrastructure closeout, regression, migration, packaging, and human-review flow and issue a release/closeout verdict without closing unmet value work.

## Acceptance Criteria

- [ ] DEMO-001 through DEMO-006 run end to end with repository-relative evidence, including lifecycle failure-without-write and visible supervision decisions.
- [ ] Every Kotlin and gaming variant has zero false passes at activation, re-boil, and closeout; every approved infrastructure/product/small-mode/legacy control has zero false blocks.
- [ ] Behavioral evaluations record supported model/runtime versions and prove an eager executor stops or reshapes rather than criticizes and continues; a human reviews the decision matrix.
- [ ] A named human completes the Delano product review on representative data and records no unresolved critical intended-job, information-architecture, copy, contextual-action, data-usefulness, or interaction-quality finding.
- [ ] Focused schema/CLI/status/evidence/skill-eval/Viewer checks, Viewer typecheck/lint/build if changed, root `npm test`, mirror parity, payload/manifest checks, release validation, package dry-run, and privacy/log safety pass or are explicitly blocked.
- [ ] AC-001 through AC-012 map to specific task/update/evaluation/product-review evidence; automated evidence is labeled supporting where human/product proof is required.
- [ ] The final closeout-readiness report compares delivered capability with the named job and explicit non-capabilities, preserves useful invisible engineering, names residual risk/skipped checks, and does not close on conformance alone.
- [ ] Working-tree and upstream state are understood; unrelated changes are preserved; commit, push, PR, tracker, public, or deployment actions occur only with explicit authorization.

## Traceability
- Story: US-001,US-002,US-003,US-004,US-005,US-006
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012

## Technical Notes

Use quality-skill and closeout-skill only after all implementation tasks and applicable human gates pass. Browser/GUI checks must follow the repository's Codex CLI delegation rule. This task may conclude `fail` or `reshape-required`; release evidence volume cannot force `pass`.

## Definition of Done
- [ ] End-to-end deterministic and behavioral gates complete
- [ ] Human product review and acceptance mapping complete
- [ ] Release/package/privacy checks pass
- [ ] Closeout-readiness verdict and residual risks recorded

## Evidence Log
- 2026-08-08T20:17:18Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
