---
id: T-009
name: Verify migration, browser workflows, package, and release gates
status: done
workstream: WS-C
created: 2026-07-14T16:49:30Z
updated: 2026-07-17T09:09:44Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004, T-005, T-006, T-007, T-008]
conflicts_with: [release-gates]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-005
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012, AC-013]
---

# Task: Verify migration, browser workflows, package, and release gates

## Description

Run risk-based final verification across contracts, migrations, Viewer behavior, validation, packaging, documentation, and supported browser handover flows, then record evidence and residual risks.

## Acceptance Criteria

- [x] Focused schema, server, UI/domain, CLI, migration, package, install, mirror, and payload tests pass.
- [x] A delegated browser smoke verifies linked-worktree review draft/publication, direct agent handover, selected cwd/provenance, reload, and stale-content behavior.
- [x] Fresh-install and upgrade fixtures prove package-owned Viewer launch and non-destructive handling of legacy .delano/viewer and .project/viewer data.
- [x] Full delano validation and release checks pass, or every environmental failure is isolated with equivalent focused evidence and an explicit pickup.
- [x] Task evidence and a project update map every acceptance scenario to durable validation output before closeout.

## Traceability
- Story: US-005
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012, AC-013

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-17T09:09:44Z: Post-closeout lifecycle and validation state verified.

- 2026-07-17T09:07:29Z: Full npm test passed 128/128; changed-file UI lint, full UI typecheck, domain checks, and production build passed; packed-package Viewer resolution, manifest 209, mirror 296, normal/release validation, and linked-worktree browser review workflow passed. AC-001 through AC-013 are mapped in the T-009 project update; non-blocking residuals are recorded there.

- 2026-07-17T08:57:24Z: Delegated browser smoke evidence: linked ws-c-browser-linked context and branch provenance displayed; local draft existed before publication; review-20260717T085319Z-3a2d88f367de.md published only under linked .project/reviews with no commit/push; reload showed Reviews=1 and opened the finding; Copy review handover referenced the tracked review path; source mutation produced Stale Source with 1 re-anchored finding. Residuals: synthetic selection logged a highlighter TypeError, and Codex hit its 10-minute bound after capturing the final stale-state screenshot but before writing its report.

- 2026-07-17T08:41:38Z: Begin medium-risk release verification across contracts, runtime, package, and browser workflows.

- 2026-07-17T08:41:38Z: Readiness review passed: T-004 through T-008 are done; runtime, migration, validation, package, and guidance surfaces are available for final verification.
- 2026-07-14T16:49:30Z: Created from .project/templates/task.md by `delano task add`.
