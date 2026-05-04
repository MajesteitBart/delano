---
id: T-001
name: Define delivery metric events
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-30T02:02:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Define delivery metric events

## Description
Decide which local events are captured, where they live, and how privacy-safe summaries are produced.

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

- 2026-04-30T02:02:00Z: Inspected learning-loop state after multi-agent tasks reached done. Added `.agents/schemas/learning/delivery-metric-event.schema.json` defining privacy-safe delivery event types and required summary fields; mirrored to `.claude`, wired `check:delivery-metrics` into PM validation and tests, and staged assets for npm packaging. Validation passed: `npm run check:delivery-metrics`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.

- 2026-04-30T02:05:00Z: Inspected learning-loop task state after multi-agent execution completion. Added `.agents/schemas/metrics/delivery-event.schema.json` defining privacy-safe local delivery metric events for status changes, validation runs, sync drift, evidence gaps, blocked time, and closeout learning; mirrored to `.claude`, added `scripts/check-delivery-metric-events.mjs`, PM validation wiring, package script, tests, and npm payload staging. Validation passed: `npm run check:delivery-metrics`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
