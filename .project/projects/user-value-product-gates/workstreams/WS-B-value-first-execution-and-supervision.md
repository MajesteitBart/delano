---
id: WS-B
name: WS-B Value-First Execution and Supervision
owner: bart
status: planned
created: 2026-08-08T20:17:15Z
updated: 2026-08-08T20:17:29Z
operating_mode: multi-stream
---

# Workstream: WS-B Value-First Execution and Supervision

## Objective

Make early vertical proof, demo-step traceability, foundation proportionality, re-boil decisions, and stop-loss authority part of normal planning and execution so completed tasks cannot conceal unchanged user capability.

## Owned Files/Areas

- Plan, workstream, and task templates/schemas for vertical proof, value roles, demo steps, and value-risk boundaries
- Planning, breakdown, execution, and supervision skill/rule guidance
- Shared value-checkpoint comparison and lifecycle guard behavior
- Status/next CLI or script projections and the minimum Viewer supervision surface
- Focused sequencing, stale-gate, blocked-start, status projection, and Viewer tests
- WS-B task evidence and decisions

## Dependencies

- T-004 depends on T-001's value vocabulary.
- T-005 consumes the activation contract from T-003 and planning trace from T-004.
- T-006 follows T-005 so UI/status projection does not invent gate semantics.
- WS-C closeout consumes the checkpoint/service boundary after T-005.

## Risks

- Tasks may mechanically map to demo IDs without making a step executable.
- Re-boil can become another progress report unless no-progress decisions block unrelated starts.
- Fixed checkpoint quotas would burden small projects and can be gamed by task splitting.
- Viewer scope can expand beyond the minimum supervision signal.

## Handoff Criteria

- Product/mixed plans schedule a human-reviewed, job-critical state-action-result vertical proof before broad foundations and name each boundary's expected critical steps.
- Every meaningful task has a valid value role and applicable demo trace; only representative executable steps count as progress, and supporting steps cannot satisfy critical boundaries.
- `reshape-required` and `stop` block unrelated task/workstream starts across CLI/direct validation paths until an owner resolution is current.
- Agents and supervisors have explicit immediate stop authority when scope cannot deliver the job.
- Status, next work, and Viewer show classification, demo progress, current decision, blockers, and required human action without equating task totals with value.
