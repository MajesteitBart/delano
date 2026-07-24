---
id: T-004
name: Derive reverse links receipts and staleness
status: done
workstream: WS-A
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T06:41:27Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [src/cli/lib/roadmap-projection.js]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-005,US-007
acceptance_criteria_ids: [AC-004, AC-006, AC-009]
---

# Task: Derive reverse links receipts and staleness

## Description

Implement a pure projection that joins roadmap items to project specs, summarizes canonical delivery receipts, determines closure eligibility, and derives advisory staleness with an injected clock.

## Acceptance Criteria

- [x] Reverse links are derived only from `spec.frontmatter.roadmap_item`; no roadmap item or index file is mutated.
- [x] Multiple project specs referencing one item appear exactly once each, while projects without a reference are excluded.
- [x] Receipt output reports linked project states, done/open/blocked task totals, newest canonical linked-artifact `updated` value, and source paths.
- [x] The projection does not invoke Git, count commits, parse a completion percentage, or normalize closeout prose.
- [x] Closure eligibility distinguishes no complete project, non-terminal linked projects, missing evidence, and eligible closure.
- [x] With an injected clock, tests cover fresh `now`, 21-day no-active-project, 21-day inactive-delivery, all-projects-terminal closure review, non-`now`, and terminal-item cases.
- [x] Identical snapshots and clocks produce byte-equivalent JSON output with deterministic ordering.

## Traceability
- Story: US-005,US-007
- Acceptance criteria: AC-004, AC-006, AC-009

## Technical Notes

Keep filesystem loading outside the pure derivation function so CLI, validator, and viewer tests can supply fixtures directly. Treat unknown legacy task/project statuses conservatively and surface them rather than dropping records.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Projection contract documented for consumers

## Evidence Log

- 2026-07-24T06:41:27Z: Implemented source-linked deterministic projection with injected clock and explicit closure/staleness reasons; node --test test/roadmap-projection.test.js passed 5/5.

- 2026-07-24T06:39:23Z: Implement pure reverse-link, receipt, closure, and staleness projection

- 2026-07-24T06:39:23Z: T-001 contract dependency is done; projection boundary is ready
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
