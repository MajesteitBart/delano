---
name: Fast Contract Validation on Windows
status: done
lead: MajesteitBart
created: 2026-07-14T15:24:35Z
updated: 2026-07-14T15:34:29Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: planned
operating_mode: scoped-change
---

# Delivery Plan: Fast Contract Validation on Windows

## What Changed After Probe

No probe was required; issue evidence and direct source inspection already isolate the subprocess-launch bottleneck.

## Technical Context

The Bash validator repeatedly invokes `awk` for each field. Python is already resolved as a required runtime and used for dependency-cycle checks, so a single inline Python process can own core contract parsing and validation without adding files or dependencies.

## Architecture Decisions

- Replace the Bash project/spec/plan/task validation loops and per-field `awk` calls with one inline Python validator invocation.
- Have the Python process emit detailed errors plus a machine-readable error count; the Bash wrapper adds that count to its aggregate result without launching another parser.
- Keep required-path, runtime, safety, package, schema, lifecycle, and other downstream checks in Bash unchanged.

## Policy and Contract Checks
- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map
- `spec.md`: Created from `.project/templates` by `delano project create`.
- `plan.md`: Created from `.project/templates` by `delano project create`.
- `workstreams/`: Created from `.project/templates` by `delano project create`.
- `tasks/`: Created from `.project/templates` by `delano project create`.

## Complexity Exceptions

- The validator remains a hybrid Bash/Python script to minimize package and invocation changes; owner: MajesteitBart.

## Probe-Driven Architecture Changes

## Workstream Design

- WS-A owns validator implementation, regression coverage, generated mirrors, packaging, and validation evidence.

## Milestone Strategy

- M1: contract and regression fixture approved.
- M2: single-process validation implemented and focused tests pass.
- M3: full validation, package drift, and test suite pass; project closes.

## Rollout Strategy

Ship the optimized validator in the canonical `.agents` runtime, then regenerate `.claude` and `assets/payload` through existing scripts.

## Test Strategy

- Add a generated 25-project/250-task performance regression test with a 30-second timeout.
- Retain and run the existing CRLF task-graph validation test.
- Run focused package tests, `delano validate`, full `npm test`, asset build, and manifest drift check.

## Rollback Strategy

Revert the validator block and regression test together; generated artifacts can then be rebuilt from the reverted canonical source.

## Remaining Delivery Risks

- Timing tests can be environment-sensitive; the 30-second ceiling is intentionally far above expected single-process time and below the reported multi-minute regression.
