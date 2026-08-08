---
id: T-003
name: Enforce activation and legacy migration
status: planned
workstream: WS-A
created: 2026-08-08T20:17:16Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002]
conflicts_with: [src/cli/commands/state.js, .agents/scripts/pm/validate.sh, .agents/scripts/check-operating-modes.mjs]
parallel: false
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-001,US-002,US-006
acceptance_criteria_ids: [AC-001, AC-002, AC-010, AC-011]
---

# Task: Enforce activation and legacy migration

## Description

Wire the approved value contract, probe state, classification, current approval, and versioned migration rules into project activation and normal validation without mutating on failure.

## Acceptance Criteria

- [ ] `delano project start` rejects a new Mode 2 through 4 project whose value contract, required probe, classification obligations, or current approval is missing, stale, or failed, and leaves every file byte-unchanged.
- [ ] Normal validation rejects an active versioned project that could not legally activate and names the exact repository-relative artifact and rule.
- [ ] Approval/checkpoint freshness is bound to the current applicable contract/demo content; editing approved scope invalidates the prior decision.
- [ ] A previewable, idempotent migration seeds only structural placeholders/versions and never invents a user, job, demo, classification, approval, progress, or product finding.
- [ ] Planned legacy projects must resolve migration before activation; active legacy projects receive a next-boundary requirement; complete/deferred history validates unchanged.
- [ ] CLI and fixture tests cover product, mixed, infrastructure, probe-pending, stale approval, direct edit, migration retry, valid Mode 0/1, large-scope/split-task Mode 0/1 laundering, active legacy, and terminal legacy cases.

## Traceability
- Story: US-001,US-002,US-006
- Acceptance criteria: AC-001, AC-002, AC-010, AC-011

## Technical Notes

Centralize precondition logic so CLI lifecycle and validators do not diverge. Do not claim reviewer identity authentication. Migration failure must preserve pre-existing user files and report unresolved human decisions.

## Definition of Done
- [ ] Activation/migration implementation complete
- [ ] No-write, freshness, and compatibility tests pass
- [ ] Review covers all lifecycle mutation paths
- [ ] Migration and trust limitations handed to T-010/T-011

## Evidence Log
- 2026-08-08T20:17:16Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
