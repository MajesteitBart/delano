---
name: Delano CLI Packaging v1
status: done
lead: bart
created: 2026-04-03T11:59:43Z
updated: 2026-04-28T22:08:32Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: approved
---

# Delivery Plan: Delano CLI Packaging v1

## What Changed After Probe
- No separate prototype was required. The project brief already constrained the target architecture, and direct inspection of the current repo supplied the implementation baseline.
- Planning therefore centers on translation rather than invention: package the existing runtime safely, wrap the current PM scripts, and tighten install behavior relative to the legacy shell installer.

## Architecture Decisions
- Ship a single scoped npm package: `@bvdm/delano`.
- Expose a single binary: `delano`.
- Keep the CLI implementation thin and plain-Node by default. JavaScript is preferred unless TypeScript remains nearly free in complexity.
- Preserve the existing shell/Python PM scripts as the execution layer for `init`, `validate`, `status`, and `next`.
- Drive packaged runtime assets from an explicit allowlist manifest so install behavior is auditable and conflict checks are deterministic.
- Keep top-level adapter entry docs out of the normal base install path; future opt-in support is acceptable, but not default behavior for this project.

## Probe-Driven Architecture Changes
- Treat the inspected repo structure and current shell installer as the reality-checked baseline for implementation.
- Carry forward the discovered mismatch between the requested npm install contract and the broader legacy installer behavior as a first-class design constraint.
- Keep `install-delano.sh` alive as a bridge path during rollout instead of forcing a hard cutover.
- Verify wrapper behavior against the current PM scripts rather than assuming their outputs or dependencies.

## Workstream Design
- `WS-A CLI Package Scaffold and Dispatch`: create package metadata, binary entrypoint, command dispatch, shared argument handling, and runtime execution helpers.
- `WS-B Asset Packaging and Conservative Install`: define the approved asset manifest, package layout, install planning, conflict reporting, force mode, and safe write path.
- `WS-C Wrapper Commands and Legacy Bridge`: wrap the current PM scripts for `init`, `validate`, `status`, and `next`, and align the legacy installer bridge to the new CLI direction without breaking it.
- `WS-D Verification and Operator Docs`: verify Windows-first flows, document the package behavior, and ensure user-facing guidance matches the shipped implementation.

## Milestone Strategy
1. Land the npm CLI skeleton and package metadata.
2. Add the allowlist asset pipeline and conflict-first install flow.
3. Add wrapper commands for the existing PM scripts and preserve the shell installer bridge.
4. Finish docs and verification for install, reinstall, force, and wrapper-command flows.

## Rollout Strategy
- Build the npm layer alongside the existing shell-first installer rather than replacing it up front.
- Sequence install safety before install writes: the plan/conflict reporter should be correct before the CLI is allowed to mutate targets.
- Keep the packaged asset set minimal and explicit so the first release is easy to audit.
- Update operator docs only after the actual command surface and install behavior are implemented, to avoid drifting into aspirational guidance.

## Test Strategy
- Smoke-test package execution locally on the current Windows-first environment.
- Validate `delano install` across first install, conflicting install, and `--force` reinstall scenarios against temporary targets.
- Verify that `delano init`, `delano validate`, `delano status`, and `delano next` delegate to the current PM scripts successfully.
- Re-run `bash .agents/scripts/pm/validate.sh` after delivery-artifact changes and again after runtime changes that affect the packaged surface.
- Check that the installed file set matches the approved payload exactly and does not materialize opt-in top-level docs by default.

## Rollback Strategy
- Revert the npm package files, asset manifests, and CLI runtime additions as a single bundle if the package path proves unsafe or misleading.
- Preserve `install-delano.sh` throughout rollout so operators retain a known bridge path while the new CLI stabilizes.
- Avoid partial merges where docs or package metadata advertise install behavior that the CLI does not yet honor.

## Remaining Delivery Risks
- Packaged-asset drift could cause the CLI to install too much or too little if the allowlist is not treated as canonical.
- Windows shell discovery and subprocess behavior may be slightly different from Unix-like environments even with `bash` available.
- Wrapper commands may expose existing PM-script output quirks that users interpret as CLI bugs.
- Publishing to npm still depends on an account with access to the `@bvdm` scope; this is external to local implementation and verification.
