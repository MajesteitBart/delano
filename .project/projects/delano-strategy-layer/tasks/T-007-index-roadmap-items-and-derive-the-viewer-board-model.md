---
id: T-007
name: Index roadmap items and derive the viewer board model
status: planned
workstream: WS-C
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T01:03:35Z
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

- [ ] The server classifies only `roadmap/RM-###-*.md` files as roadmap items and exposes their canonical projection fields without treating `roadmap/README.md` as an item.
- [ ] Viewer index/types expose roadmap items, linked source paths, receipts, closure eligibility, and staleness reasons without a second persisted index.
- [ ] The pure board model places every non-terminal item in exactly one `now|next|later` lane and every terminal item in archive.
- [ ] Missing/unknown values produce an explicit warning state rather than dropping an item or inventing a lane.
- [ ] Card models contain no timeline, target, dependency, estimate, assignee, velocity, commit-count, or percentage field.
- [ ] Focused server/domain tests cover empty, mixed-lane, terminal, one-to-many, blocked-task, unknown-status, and staleness fixtures.

## Traceability
- Story: US-005,US-007
- Acceptance criteria: AC-006, AC-009

## Technical Notes

Reuse the shared projection service or its pure output shape; do not reimplement link/lifecycle logic in React. Keep all display ordering deterministic.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Index/domain contract documented in tests

## Evidence Log
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
