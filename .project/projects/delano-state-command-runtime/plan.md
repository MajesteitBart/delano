---
name: Delano State Command Runtime
status: done
lead: bart
created: 2026-05-12T11:25:19Z
updated: 2026-05-12T13:32:48Z
linear_project_id: 
risk_level: medium
spec_status_at_plan_time: active
---

# Delivery Plan: Delano State Command Runtime

## What Changed After Probe

No separate probe was needed. The key design constraint is now explicit: creation commands use `.project/templates`; lifecycle commands patch existing artifacts only.

## Technical Context

Current CLI routing lives in `src/cli/index.js`. Some behavior still shells out to `.agents/scripts/pm/*.sh`, and those scripts contain inline markdown generators. The first slice should introduce a native state command path without removing legacy wrappers until the replacement behavior is proven.

## Architecture Decisions

- Keep `src/cli/index.js` as the command registry and thin dispatch point.
- Prefer a project-state helper layer for reading, rendering templates, patching frontmatter, and writing artifacts.
- Render creation artifacts from `.project/templates` only.
- Do not use templates for lifecycle transitions.
- Keep full validation as an audit/release command, not the normal transition path.

## Policy and Contract Checks
- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map
- `spec.md`: rendered from `.project/templates/spec.md`
- `plan.md`: rendered from `.project/templates/plan.md`
- `workstreams/`: rendered from `.project/templates/workstream.md`
- `tasks/`: rendered from `.project/templates/task.md`
- `updates/`: rendered from `.project/templates/progress-update.md`

## Complexity Exceptions
- The first implementation may keep some logic in `src/cli/index.js` only long enough to preserve a small patch, but extraction into `src/cli/lib/project-state.js` is the preferred shape before closeout.

## Probe-Driven Architecture Changes

Not applicable.

## Workstream Design

- WS-A: Native State Commands and Template Rendering.
- WS-B: Legacy Generator Alignment and Closeout.

## Milestone Strategy

1. Establish project contract and task scope.
2. Implement template-backed create/add commands.
3. Implement or keep patch-only lifecycle transitions with focused tests.
4. Decide whether legacy shell generators are redirected or deferred.
5. Run validation and record evidence.

## Rollout Strategy

Ship behind explicit commands first. Keep existing wrappers available while tests prove the native path.

## Test Strategy

- Unit tests for command parsing.
- Fixture tests using temporary repositories to prove template-backed file creation.
- Lifecycle tests proving patch-only state changes and rollups.
- `bash .agents/scripts/pm/validate.sh`.
- `npm test`.

## Rollback Strategy

If native commands prove too broad for this branch, keep the workstream validation changes and defer state command runtime behind documented follow-up tasks.

## Remaining Delivery Risks

- Command surface may grow too quickly if project/workstream/task/update verbs are not kept minimal.
- Legacy wrappers may continue to drift if not redirected or explicitly marked as transitional.
- Broad `index.js` changes can become hard to maintain without helper extraction.
