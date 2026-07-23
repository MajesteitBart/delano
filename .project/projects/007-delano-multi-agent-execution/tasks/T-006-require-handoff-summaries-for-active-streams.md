---
id: T-006
name: Require handoff summaries for active streams
status: done
workstream: WS-C
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T01:55:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004, T-005]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Require handoff summaries for active streams

## Description
Capture what changed, evidence gathered, blockers, lease state, and next safe action for each stream.

## Acceptance Criteria
- [x] Current repo state has been inspected before implementation starts.
- [x] The delivered change is represented in Delano runtime assets, project contracts, validation, fixtures, or docs as appropriate.
- [x] The change is validated with the smallest meaningful command or fixture.
- [x] Evidence is recorded in this task or a task update before the task is marked done.

## Technical Notes
- This task came from the Delano next-step roadmap review.
- Keep behavior additive or dry-run-first when the task touches validation, remote sync, logs, or write-capable commands.
- Do not claim completion from documentation alone unless the task is explicitly documentation-only.

## Definition of Done
- [x] Implementation or contract creation complete
- [x] Validation or focused test passes
- [x] Review complete
- [x] Docs updated where behavior changes

## Evidence Log
- 2026-04-28T23:14:00Z: Task created from roadmap review; implementation evidence pending.

- 2026-04-30T01:55:00Z: Inspected multi-agent execution state after `aad9bb8`. Tightened `scripts/lease-manager.mjs release` so releasing an active stream lease requires `--handoff` and records the summary on the lease; mirrored to `.agents` and `.claude`. Added a regression test for missing handoff blocking release. Validation passed: `npm run check:lease-manager`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
