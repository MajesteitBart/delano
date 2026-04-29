---
name: Delano vNext Runtime Upgrade
status: planned
lead: bart
created: 2026-04-29T21:57:00Z
updated: 2026-04-29T21:57:00Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: planned
target_version: 0.2.0
---

# Delivery Plan: Delano vNext Runtime Upgrade

## What Changed After Review

The review is being treated as a roadmap input, not as implementation gospel. The decision is to create a v0.2 umbrella project and keep the major workstreams as separate child projects so Delano can dogfood its own process.

## Architecture Decisions

1. **Version umbrella plus child projects**
   - `delano-vnext-runtime-upgrade` owns sequencing and release readiness.
   - The five child projects own implementation depth.

2. **Trust first**
   - Logging/path/package safety ships before write-capable sync automation.

3. **Contracts before dashboards**
   - Schemas, validators, fixtures, and CLI checks matter more than visual surfaces for v0.2.

4. **Outcome-first agent instructions**
   - Root and adapter docs should become compact operational indexes, informed by OpenAI prompt guidance.
   - Avoid large duplicated prompt stacks across adapters.

## Probe-Driven Architecture Changes

Required probes before full implementation:
- Validate current hook logging behavior and what is actually persisted.
- Confirm package/manifest drift sources and expected generated files.
- Test schema validation choices against existing `.project` artifacts.
- Test mocked GitHub/Linear drift reports before any apply flow.
- Test lease format against realistic parallel file ownership scenarios.

## Workstream Design

- **WS-A Trust Baseline:** unblock safe development by fixing logging, path output, package drift, and agent entry docs.
- **WS-B Contract Runtime:** add schemas, operating modes, state transitions, and evidence-before-done gates.
- **WS-C Sync Runtime:** add dry-run drift detection and safe repair planning for GitHub/Linear.
- **WS-D Parallel Runtime:** add leases, conflict-zone checks, stream-aware next task selection, and handoff health.
- **WS-E Learning Runtime:** add metrics, context audit, fixtures/evals, and closeout-to-rules workflow.

## Milestone Strategy

1. **M0: Project framing complete**
   - Umbrella project created.
   - Child project mapping documented.

2. **M1: Safe runtime baseline**
   - Trust/safety child project complete.
   - Agent docs are compact and operational.

3. **M2: Enforceable local contracts**
   - Schema and strict validation child project complete enough for v0.2.

4. **M3: Dry-run operational intelligence**
   - Sync drift reporting and lease validation work locally without remote mutation.

5. **M4: Release readiness**
   - Tests/fixtures pass.
   - Package metadata is coherent.
   - Closeout documents v0.2 boundaries.

## Rollout Strategy

- Keep changes local-first and backwards-compatible where possible.
- Add new commands as dry-run/read-only before apply-capable flows.
- Document migration notes for existing installed Delano repos.
- Release as `0.2.0` only after trust, contract, and package checks pass.

## Test Strategy

- `npm test`
- package/manifest drift check
- `.agents/scripts/pm/validate.sh` on the Delano repo
- strict validator fixture tests when added
- sync dry-run tests with mocked remote data
- lease/conflict fixture tests
- manual review of root/adaptor instruction files for compactness and command clarity

## Rollback Strategy

- Keep v0.2 changes in isolated commands/assets where possible.
- Do not replace existing PM scripts until new behavior has fixture coverage.
- Any remote mutation flow must ship behind dry-run and explicit apply gates.

## Remaining Delivery Risks

- Scope creep: the review is broad enough to become multiple releases.
- Validator strictness may expose existing artifact debt that needs migration.
- Linear API behavior may require a dedicated probe before reliable sync.
- Prompt docs can become too verbose if guidance is copied instead of distilled.
