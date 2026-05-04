---
id: T-004
name: Sequence v0.2 implementation
status: done
workstream: WS-A
created: 2026-04-29T21:57:00Z
updated: 2026-04-30T02:52:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002]
conflicts_with: []
parallel: false
priority: medium
estimate: S
---

# Task: Sequence v0.2 implementation

## Description

Turn the umbrella plan into an execution sequence that starts with trust/safety, then contract enforcement, then dry-run sync/parallel/learning capabilities.

## Acceptance Criteria
- [x] The recommended first child project is explicit.
- [x] Dependencies between child projects are documented.
- [x] The plan identifies what can run in parallel after trust/safety lands.

## Technical Notes

Recommended order:
1. Trust and safety runtime.
2. Contract enforcement.
3. Operational sync dry-run.
4. Multi-agent leases.
5. Learning loop and evals.

## Definition of Done
- [x] Sequence documented in plan or update.
- [x] Any risky parallelism is called out.

## Evidence Log
- 2026-04-30T02:52:00Z: Updated umbrella sequencing to reflect the executed v0.2 order: trust/safety first, contract enforcement second, operational sync dry-run third, multi-agent leases fourth, learning loop/evals fifth, with parallelism only after trust/safety and contract gates were in place. Validation passed: `bash .agents/scripts/pm/validate.sh`; `npm test`.
