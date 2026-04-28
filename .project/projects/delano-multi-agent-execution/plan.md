---
name: Delano Multi-Agent Execution
status: planned
lead: bart
created: 2026-04-28T23:14:00Z
updated: 2026-04-28T23:14:00Z
linear_project_id:
risk_level: high
spec_status_at_plan_time: active
---

# Delivery Plan: Delano Multi-Agent Execution

## What Changed After Probe
- No implementation probe has run yet. This plan translates the external roadmap review into Delano-native delivery contracts.
- Each task should begin with repo-state verification because the review was static and the repository may continue moving.

## Architecture Decisions
- Keep this roadmap phase as an independent Delano project so it can be prioritized, implemented, validated, and closed separately.
- Use existing `.project` conventions first; do not invent a new planning system for roadmap management.
- Treat validation and evidence as part of delivery, not documentation afterthoughts.

## Probe-Driven Architecture Changes
- Probe-required items remain marked in the spec until the first implementation task validates current constraints.
- If a task discovers the roadmap recommendation is stale, update the task and decisions log before implementation.

## Workstream Design
- `WS-A Lease Contracts and Locking`: Represent path ownership, task ownership, expiry, and exclusive conflict areas.
- `WS-B Conflict-Aware Next Task Selection`: Make ready-task selection account for active leases, dependencies, priorities, and stream capacity.
- `WS-C Worktree and Handoff Health`: Add worktree checks and required handoff summaries for agent-to-agent continuity.
- `WS-D Collision Metrics and Validation`: Track collisions, blocked time, expired leases, and validation failures caused by coordination issues.


## Milestone Strategy
1. Verify the current repo state and update decisions if the roadmap has drifted.
2. Implement the smallest enforceable contract or runtime behavior for each workstream.
3. Add validation or fixtures before claiming the new behavior is reliable.
4. Capture evidence and close the project with follow-up decisions.

## Rollout Strategy
- Prefer additive contracts, validators, and commands before changing existing operator flows.
- Make risky or remote-writing behavior dry-run first.
- Keep documentation aligned with implemented behavior only.

## Test Strategy
- Run the existing PM validator after contract changes.
- Add or update focused tests for runtime changes introduced by the project.
- Use fixtures for validator behavior so failure modes stay reproducible.

## Rollback Strategy
- Keep each workstream change reviewable and revertible as a small bundle.
- Preserve existing Delano workflows while new gates mature.
- If validation becomes too strict for current artifacts, gate it behind strict mode until migration is planned.

## Remaining Delivery Risks
- The roadmap may over-specify future behavior before current implementation details are fully inspected.
- Validation work can create migration pressure across existing artifacts.
- Remote sync and multi-agent coordination require careful safety boundaries before apply-capable flows.
