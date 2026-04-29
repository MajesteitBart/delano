---
id: T-004
name: Sequence v0.2 implementation
status: ready
workstream: WS-A
created: 2026-04-29T21:57:00Z
updated: 2026-04-29T21:57:00Z
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
- [ ] The recommended first child project is explicit.
- [ ] Dependencies between child projects are documented.
- [ ] The plan identifies what can run in parallel after trust/safety lands.

## Technical Notes

Recommended order:
1. Trust and safety runtime.
2. Contract enforcement.
3. Operational sync dry-run.
4. Multi-agent leases.
5. Learning loop and evals.

## Definition of Done
- [ ] Sequence documented in plan or update.
- [ ] Any risky parallelism is called out.

## Evidence Log
- Pending.
