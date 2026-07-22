---
id: T-005
name: Migrate legacy reviews and hand over tracked findings
status: done
workstream: WS-B
created: 2026-07-14T16:49:28Z
updated: 2026-07-16T20:55:08Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-004]
conflicts_with: [.delano/viewer/server.js]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-005
acceptance_criteria_ids: [AC-005, AC-009]
---

# Task: Migrate legacy reviews and hand over tracked findings

## Description

Provide an explicit idempotent migration/dual-read path for legacy annotation and handover state, preserve apply-audit evidence, and make agent handovers reference tracked review artifacts directly.

## Acceptance Criteria

- [x] Migration preserves comments, anchors, resolution state, source provenance, and apply-audit evidence or reports each unmappable record without data loss.
- [x] Repeated migration produces no duplicate reviews and never deletes or rewrites legacy source data implicitly.
- [x] Review handover prompts reference the tracked .project/reviews path and launch in the selected worktree.
- [x] Generated handover Markdown is no longer canonical output; any activity receipt is local and contains no committed machine path.
- [x] Fixture tests cover empty, corrupt, mixed, previously migrated, and ambiguous legacy stores.

## Traceability
- Story: US-005
- Acceptance criteria: AC-005, AC-009

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-16T20:55:08Z: Focused Viewer migration/handover tests 4/4 passed; changed UI eslint passed; UI production build passed.

- 2026-07-16T20:50:25Z: Implement explicit non-destructive legacy migration and direct tracked-review handover.

- 2026-07-16T20:50:24Z: Readiness review passed: T-003 and T-004 are done; tracked review backend and UX are available.
- 2026-07-14T16:49:28Z: Created from .project/templates/task.md by `delano task add`.
