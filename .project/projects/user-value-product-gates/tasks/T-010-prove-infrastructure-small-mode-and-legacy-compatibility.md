---
id: T-010
name: Prove infrastructure small-mode and legacy compatibility
status: planned
workstream: WS-D
created: 2026-08-08T20:17:17Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-005, T-008]
conflicts_with: [.agents/validation-fixtures/**, test/cli.test.js, test/package.test.js]
parallel: true
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-002,US-006
acceptance_criteria_ids: [AC-002, AC-010, AC-011]
---

# Task: Prove infrastructure small-mode and legacy compatibility

## Description

Build the positive and migration control matrix that proves value gates preserve honest invisible engineering, light Mode 0/1 work, and readable historical state without recreating an infrastructure escape hatch.

## Acceptance Criteria

- [ ] A valid infrastructure fixture with a technical promise, explicit zero-new-user-capability disclosure, first felt-value boundary, and owner acceptance activates and closes through the infrastructure path.
- [ ] Infrastructure fixtures with a fake user payoff, missing boundary, stale acceptance, or attempted product-success claim fail at the applicable gate.
- [ ] Genuinely bounded Mode 0 patch and Mode 1 scoped-change fixtures create, execute, validate, and close without a new mandatory artifact family or product review; large-scope and split-task laundering controls require Mode 2+.
- [ ] Complete/deferred legacy projects validate unchanged; planned legacy projects must migrate before activation; active legacy projects receive a next-boundary requirement and cannot close silently.
- [ ] Migration preview/retry is idempotent, preserves unknown/user content, and never invents human decisions, demo progress, or findings.
- [ ] Compatibility tests cover repositories with and without Viewer/generated assets, Windows path/newline behavior, and a representative portfolio without material validation regression.
- [ ] The approved matrix records zero false blocks for valid infrastructure, useful product, small-mode, and terminal legacy controls.

## Traceability
- Story: US-002,US-006
- Acceptance criteria: AC-002, AC-010, AC-011

## Technical Notes

Do not use creation timestamps as the compatibility boundary. Treat an unscheduled first felt-value project as an explicit owner decision per OD-003, not an inferred validator pass.

## Definition of Done
- [ ] Control and migration fixtures complete
- [ ] CLI/package/portfolio compatibility tests pass
- [ ] Human-reviewed false-block matrix recorded
- [ ] Adoption constraints handed to T-011/T-012

## Evidence Log
- 2026-08-08T20:17:17Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
