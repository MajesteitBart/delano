---
id: WS-B
name: WS-B Viewer and Validation Runtime
owner: bart
status: done
created: 2026-07-14T16:45:49Z
updated: 2026-07-16T20:57:49Z
operating_mode: feature
---

# Workstream: WS-B Viewer and Validation Runtime

## Objective

Implement safe selected-worktree dispatch, review publication, direct agent handover, guarded contract writes, migration, and validation semantics against the contracts produced by WS-A.

## Owned Files/Areas

- `.delano/viewer/server.js` and `.delano/viewer/ui/`
- Viewer server/UI/domain tests and review migration fixtures
- `src/cli` Viewer/validation help or commands required by the feature
- `.agents/scripts/pm/validate.sh` and checkout-state validation tests

## Dependencies

- WS-A capability contract, review schema/template, hash definition, and legacy mapping
- Existing repository registry/worktree discovery, context generation, containment, baseline, activity, and agent-launch infrastructure

## Risks

- Client capability display and server enforcement drift.
- Context switches or branch changes race a launch/write after validation.
- Dual-read migration duplicates findings or mutates legacy evidence.
- Review publication unintentionally commits, pushes, or leaks local paths.

## Handoff Criteria

- Focused server/UI/CLI tests prove capability parity and fresh-context failure behavior in primary and linked checkouts.
- Draft/publish/resolve/archive and direct review-path handover work without generated canonical handover files.
- Legacy migration is explicit, idempotent, non-destructive, and privacy-safe.
- Normal and release validation apply the documented checkout-neutral policy.

## Outcome Review

### Actual Outcome

WS-B now launches and writes against the selected registered worktree, exposes endpoint-specific capabilities separately from context risk, publishes schema-valid tracked reviews from private local drafts, renders and updates review lifecycle state, hands tracked review paths directly to agents, migrates legacy evidence explicitly and idempotently, permits guarded apply in linked worktrees, and reports/enforces dirty `.project` state consistently across checkout roles.

### Delta

All WS-B tasks and handoff criteria are complete. Project-wide normal validation reaches the mirror-parity gate and then fails because WS-C/T-008 has not yet regenerated the `.claude` compatibility mirror for the canonical validation script and captured test evidence. That downstream distribution alignment is outside WS-B ownership.

### Quality Evidence

- `npm test`: 126/126 passed.
- Viewer UI domain checks passed.
- Viewer UI production build passed; the existing chunk-size advisory remains non-blocking.
- Changed UI files passed ESLint. Repository-wide UI lint retains seven pre-existing violations in untouched generated/shadcn files.
- `delano validate` equivalent contract validation reported dirty branch-local provenance as a warning and completed every gate except the expected WS-C-owned Claude mirror parity step.

### Follow-up

- WS-C/T-008 must regenerate the `.claude` mirror and generated assets, then rerun normal and release validation.
- WS-C/T-009 remains responsible for delegated browser smoke and final package/release gates.
