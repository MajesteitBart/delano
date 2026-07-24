---
id: T-007
name: Index roadmap items and derive the viewer board model
status: done
workstream: WS-C
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T12:43:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004]
conflicts_with: [.delano/viewer/server.js, .delano/viewer/ui/src/lib/domain/types.ts, .delano/viewer/ui/src/lib/domain/roadmap.ts]
parallel: true
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-005,US-007
acceptance_criteria_ids: [AC-006, AC-009]
---

# Task: Index roadmap items and derive the viewer board model

## Description

Teach the viewer index to identify roadmap items and build a pure board model from roadmap projection data before composing any page or write interaction.

## Acceptance Criteria

- [x] The server classifies only `roadmap/RM-###-*.md` files as roadmap items and exposes their canonical projection fields without treating `roadmap/README.md` as an item.
- [x] Viewer index/types expose roadmap items, linked source paths, receipts, closure eligibility, and staleness reasons without a second persisted index.
- [x] The pure board model places every non-terminal item in exactly one `now|next|later` lane and every terminal item in archive.
- [x] Missing/unknown values produce an explicit warning state rather than dropping an item or inventing a lane.
- [x] Card models contain no timeline, target, dependency, estimate, assignee, velocity, commit-count, or percentage field.
- [x] Focused server/domain tests cover empty, mixed-lane, terminal, one-to-many, blocked-task, unknown-status, and staleness fixtures.

## Traceability
- Story: US-005,US-007
- Acceptance criteria: AC-006, AC-009

## Technical Notes

Reuse the shared projection service or its pure output shape; do not reimplement link/lifecycle logic in React. Keep all display ordering deterministic.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Index/domain contract documented in tests

## Evidence Log

- 2026-07-24T12:16:13Z: Server classifies roadmap/RM-###-*.md as roadmap-item (README stays non-item), exposes roadmapItemId and an index.roadmap block derived from the shared T-004 projection; pure board model in ui/src/lib/domain/roadmap.ts places every item exactly once across now/next/later lanes, archive, and explicit attention states with no scheduling fields. Evidence: node --test test/viewer-server.test.js 20/20 pass incl. 2 new roadmap tests; ui test:domain pass with empty/mixed/terminal/one-to-many/blocked/unknown-status/staleness fixtures; tsc --noEmit and eslint clean.

- 2026-07-24T12:07:58Z: Dependency-safe: T-004 projection contract is done
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
