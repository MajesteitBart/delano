---
id: T-011
name: Refresh and highlight affected cards from live events
status: planned
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-010]
conflicts_with: [.delano/viewer/ui/src/app/useLiveEvents.ts, .delano/viewer/ui/src/lib/domain/roadmap.ts, .delano/viewer/ui/src/pages/roadmap/**]
parallel: true
priority: medium
estimate: M
operating_mode: multi-stream
story_id: US-005,US-007
acceptance_criteria_ids: [AC-008, AC-009]
---

# Task: Refresh and highlight affected cards from live events

## Description

Map roadmap and linked delivery document events to affected items, refresh the existing index, and give changed cards bounded non-disruptive feedback.

## Acceptance Criteria

- [ ] A roadmap item create/modify/delete event refreshes the board and marks only that item as affected when it still exists.
- [ ] A linked project spec, task, progress, evidence, or closeout document event marks every roadmap item derived from that project.
- [ ] An unrelated context, template, review, or unlinked project event does not flash a roadmap card.
- [ ] Change feedback is bounded in time, does not reorder cards beyond canonical model ordering, and is conveyed without color alone.
- [ ] Burst/coalesced events converge on the latest full index without duplicate permanent activity state.
- [ ] Fake-clock/domain tests cover direct, linked, unrelated, deleted, multi-item, and burst cases; existing SSE server tests remain green.

## Traceability
- Story: US-005,US-007
- Acceptance criteria: AC-008, AC-009

## Technical Notes

Treat `fs.watch` paths as invalidation hints and use the refreshed index for truth. Reuse the single application SSE subscription; do not open a second EventSource for the board.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Live-update behavior documented in viewer guidance

## Evidence Log
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
