---
id: T-011
name: Refresh and highlight affected cards from live events
status: done
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T12:43:22Z
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

- [x] A roadmap item create/modify/delete event refreshes the board and marks only that item as affected when it still exists.
- [x] A linked project spec, task, progress, evidence, or closeout document event marks every roadmap item derived from that project.
- [x] An unrelated context, template, review, or unlinked project event does not flash a roadmap card.
- [x] Change feedback is bounded in time, does not reorder cards beyond canonical model ordering, and is conveyed without color alone.
- [x] Burst/coalesced events converge on the latest full index without duplicate permanent activity state.
- [x] Fake-clock/domain tests cover direct, linked, unrelated, deleted, multi-item, and burst cases; existing SSE server tests remain green.

## Traceability
- Story: US-005,US-007
- Acceptance criteria: AC-008, AC-009

## Technical Notes

Treat `fs.watch` paths as invalidation hints and use the refreshed index for truth. Reuse the single application SSE subscription; do not open a second EventSource for the board.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Live-update behavior documented in viewer guidance

## Evidence Log

- 2026-07-24T12:41:12Z: Live-event mapping added: pure affectedRoadmapItemIds/deriveRoadmapCardActivity in the roadmap domain (roadmap item events mark only that surviving item, any linked-project dossier document marks every derived item, context/template/review/unlinked events map to nothing, deleted items stop resolving against the refreshed projection, bursts coalesce with a bounded expiry that unrelated events cannot extend), consumed by useRoadmapCardActivity which reuses the app's single SSE subscription via the liveEvent prop with capped tracked events and timer-based expiry. Cards get a finite two-pulse animation plus a textual Updated chip; ordering stays canonical. Evidence: check-domain fake-clock tests cover direct/linked/unrelated/deleted/multi-item/burst/future-event cases; roadmap page suite 13/13; tsc and eslint clean; existing SSE server tests stay green in the 23/23 viewer-server suite.

- 2026-07-24T12:35:54Z: Dependency-safe: T-010 is done; final board action surface is stable
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
