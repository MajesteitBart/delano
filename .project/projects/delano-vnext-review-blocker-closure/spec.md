---
name: Delano vNext Review Blocker Closure
slug: delano-vnext-review-blocker-closure
owner: bart
status: active
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
outcome: Close every still-open vNext review blocker with validated fixes before the v0.2 runtime upgrade is called complete.
uncertainty: medium
probe_required: true
probe_status: completed
source_review: tmp/review_vnext.md
target_version: 0.2.0
---

# Spec: Delano vNext Review Blocker Closure

## Executive Summary

The vNext runtime branch has useful foundation work, but the latest review still leaves several merge-blocking issues unresolved. This project is the focused closure track for those blockers: path privacy, stale package metadata, package payload drift, handbook/runtime contract drift, local validation failures, and CI enforcement.

The goal is not to expand v0.2 into every future maturity item. The goal is to make the current branch honest, privacy-safe, locally green, and clear about what v0.2 includes versus what remains deferred.

## Problem and Users

The current branch can appear complete while still carrying privacy leakage, stale release metadata, contradictory process contracts, failing local tests, and no CI gate that proves those checks continue to pass.

Primary users:
- Delano maintainers deciding whether the vNext runtime upgrade is ready.
- Coding agents that need one canonical status/process model.
- Operators who rely on package payload and validation gates before installing or releasing Delano.

## Outcome and Success Metrics

This project is successful when:
- No project/runtime contract contains a user-specific absolute path.
- Path scanners catch Windows, Unix, and WSL-style absolute path leakage.
- `pack-output.json`, `package.json`, `assets/install-manifest.json`, and `assets/payload/` are either synchronized or governed by a documented tracking policy.
- `HANDBOOK.md`, schemas, templates, validators, and current artifacts agree on canonical status values.
- `HANDBOOK.md` documents the v0.2 runtime model: operating modes, contract validation, evidence expectations, dry-run sync boundaries, lease semantics, and deferred maturity gates.
- `npm test`, `npm run check:package-manifest`, and the PM validation path pass in the supported local environment.
- GitHub Actions or an equivalent CI workflow runs the release-blocking validation set on pull requests.

## Scope

### In Scope

- Fixing the still-open pre-merge blockers from `tmp/review_vnext.md`.
- Fixing local gate failures discovered while checking those blockers.
- Updating runtime validators, fixtures, templates, package payloads, and handbook text required for blocker closure.
- Adding CI coverage for the blocker-closing validation commands.
- Recording task evidence before tasks are marked done.

### Out of Scope

- Implementing full GitHub or Linear remote write automation.
- Building a dashboard or enterprise portfolio surface.
- Replacing targeted validators with a complete state-machine engine unless needed to close the status-contract blocker.
- Completing every post-v0.2 maturity recommendation from the review, such as full remote sync adapters or a comprehensive evidence ledger, unless it is required by a blocker task.

## Functional Requirements

- Replace the leaked local source-review path with a repo-safe reference.
- Extend path-leak detection and repair tooling to cover WSL drive-mount paths without leaking example user paths.
- Decide whether `pack-output.json` is tracked, regenerated, or removed; enforce that decision in validation.
- Rebuild generated runtime assets and update package/manifest checks so drift is caught.
- Pick one canonical status model and update every handbook/schema/template/runtime surface that currently contradicts it.
- Repair current failing test cases for drift reports and context audit scoring.
- Add a CI workflow that runs the minimum release-blocking checks.

## Non-Functional Requirements

- Keep the project local-first and agent-agnostic.
- Preserve privacy-safe defaults.
- Avoid remote writes unless a later task explicitly adds an approved apply gate.
- Keep changes task-scoped and supported by focused validation.
- Do not leak local absolute paths in new docs, contracts, fixtures, or output examples.

## Hypotheses and Unknowns

- The stale package payload and package-manifest failures are likely repairable by rebuilding assets and tightening the drift check.
- The current PM validation failure under Git Bash may be an environment PATH issue, but the release gate should still be reliable or explicitly documented for Windows operators.
- Status alignment may require migrating existing project artifacts, not only changing schemas and templates.
- CI can start with local validation and package checks before any release publishing automation is added.

## Touchpoints to Exercise

- `.project/projects/delano-vnext-runtime-upgrade/spec.md`
- `.agents/scripts/pm/validate.sh`
- `.agents/scripts/check-path-standards.sh`
- `.agents/scripts/fix-path-standards.sh`
- `.agents/validation-fixtures/strict/`
- `HANDBOOK.md`
- `.agents/schemas/`
- `.project/templates/`
- `assets/install-manifest.json`
- `assets/payload/`
- `pack-output.json`
- `scripts/build-drift-report.mjs`
- `scripts/check-context-audit.mjs`
- `.github/workflows/`

## Probe Findings

- The vNext spec still stores a user-specific WSL-mounted absolute path in `source_review`.
- Existing path checks do not detect WSL drive-mount absolute paths.
- `package.json` reports version `0.1.7`, while `pack-output.json` still reports `0.1.4`.
- `npm run check:package-manifest` fails because generated payload files are stale or mismatched against the install manifest.
- `npm test` currently fails in drift-report JSON parsing and context-audit path assertions.
- `HANDBOOK.md` has not been updated in the recent vNext commits and still disagrees with schemas/templates on status values.
- The only existing workflow is a manual npm publish workflow; it is not a PR validation gate.

## Footguns Discovered

- A privacy leak can pass validation when the scanner only covers some absolute path forms.
- A release artifact can stay stale even when package version and install manifest checks exist.
- Additive validators can make a branch look safer than it is if they warn instead of failing on release-blocking contradictions.
- Tests that parse script output as JSON need the script invocation and mode to be unambiguous.

## Remaining Unknowns

- Whether `pack-output.json` should remain tracked after v0.2.
- Whether the canonical status model should preserve handbook values, schema values, or a deliberate migration model.
- Whether PM validation should support Git Bash Node discovery directly or require a documented PowerShell/npm entrypoint on Windows.

## Dependencies

- Current vNext branch state at `b9023e1`.
- Existing Delano package/runtime scripts.
- Existing package install manifest and generated payload pipeline.
- GitHub Actions availability for repository CI.

## Approval Notes

Treat this spec as approved for planning and task breakdown because the user explicitly requested a project containing the unresolved blockers and asked to follow the full Delano process.
