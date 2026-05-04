---
name: Delano vNext Review Blocker Closure
status: planned
lead: bart
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
linear_project_id:
risk_level: high
spec_status_at_plan_time: active
target_version: 0.2.0
---

# Delivery Plan: Delano vNext Review Blocker Closure

## What Changed After Probe

The blocker list was checked against the current branch before this project was created. Some closeout and learning-loop work landed in recent commits, but core blockers remain open: privacy/path scanning, stale package metadata, package payload drift, handbook/schema/template status drift, failing tests, and missing PR CI.

The sync wording blocker is treated as already handled for this project because the vNext closeout and release gates now describe dry-run/apply-gated boundaries. This project will still verify handbook wording while updating the runtime model.

## Architecture Decisions

1. **Blocker closure before maturity expansion**
   - This project closes the still-open pre-merge blockers and reproduced local gate failures.
   - Larger maturity work stays out of scope unless a blocker cannot be closed without it.

2. **Privacy and package trust first**
   - Path leakage and stale package metadata undermine release trust and should be fixed before broader documentation and CI claims.

3. **One canonical status model**
   - Handbook, schemas, templates, validators, and current artifacts must agree. If migration is needed, it should be explicit and validated.

4. **CI after local gates are green**
   - CI should encode passing local gates, not institutionalize known failures.

## Probe-Driven Architecture Changes

- Use a generic WSL path-leak fixture rather than a real local path.
- Add package metadata drift coverage for tracked package outputs or remove the stale tracked artifact.
- Treat current `npm test` failures as release blockers, not incidental test debt.
- Verify Windows execution assumptions for PM validation before documenting the final gate sequence.

## Workstream Design

- `WS-A Privacy and Path Safety`: Remove the leaked path and make scanners catch WSL absolute paths.
- `WS-B Package and Payload Integrity`: Close stale package metadata and generated payload drift.
- `WS-C Handbook and Contract Alignment`: Reconcile status models and document the implemented v0.2 runtime.
- `WS-D Validation and CI Gates`: Repair failing tests, make local validation reliable, and add PR checks.

## Milestone Strategy

1. Remove privacy leakage and extend path-leak validation.
2. Resolve package output and payload drift so package checks are meaningful.
3. Align handbook, schemas, templates, and current artifacts on status/runtime semantics.
4. Fix failing local tests and PM validation reliability.
5. Add CI and record final blocker-closeout evidence.

## Rollout Strategy

- Keep each fix small and separately validated.
- Rebuild generated assets only after source runtime assets and manifest decisions are clear.
- Introduce CI as a validation workflow before any release/publish automation changes.
- Keep remote mutation behavior dry-run/apply-gated.

## Test Strategy

- `npm run check:package-manifest`
- `npm test`
- `bash .agents/scripts/pm/validate.sh` in the documented supported shell environment
- Focused checks for path scanners and strict fixtures
- A PR CI run or local workflow-equivalent evidence after CI is added

## Rollback Strategy

- Revert each workstream as a focused bundle if it breaks unrelated runtime behavior.
- If canonical status alignment exposes broader artifact debt, document the migration boundary and keep only blocker-required changes in this project.
- If CI cannot be enabled immediately, land the workflow file and record the external repository setting as a blocker.

## Remaining Delivery Risks

- Status alignment may require touching many existing contracts and templates.
- Payload rebuilds may expose install-manifest design drift beyond the stale files already identified.
- Windows/Git Bash validation behavior may vary by local Node installation and PATH setup.
- CI may need repository permissions or secrets that are outside local implementation control.
