---
id: T-008
name: Compose the board archive and source navigation
status: planned
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-007]
conflicts_with: [.delano/viewer/ui/src/lib/domain/navigation.ts, .delano/viewer/ui/src/pages/roadmap/**, .delano/viewer/ui/src/index.css]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-002,US-005,US-007
acceptance_criteria_ids: [AC-006, AC-009]
---

# Task: Compose the board archive and source navigation

## Description

Compose a read-first roadmap workspace with accessible horizon lanes, terminal archive, evidence-backed cards, source navigation, and honest empty/warning states.

## Acceptance Criteria

- [ ] Workspace navigation exposes Roadmap only from the indexed roadmap capability and shows an adoption empty state when no item exists.
- [ ] Desktop and narrow layouts render `now`, `next`, and `later` lanes without horizontal page overflow; terminal items are available through an archive control.
- [ ] Each card shows item intent, status, linked project-state counts, done/open/blocked task totals, latest canonical activity, and staleness reasons from the board model.
- [ ] Item and linked-project controls navigate to the canonical source documents.
- [ ] Advisory staleness is visually/textually distinct from blocked or invalid lifecycle status.
- [ ] Every read interaction is keyboard reachable, and understanding the board does not depend on drag-and-drop or color alone.
- [ ] Focused component/source tests cover empty, single-lane, mixed, archived, stale, blocked, long-title, and narrow states.

## Traceability
- Story: US-002,US-005,US-007
- Acceptance criteria: AC-006, AC-009

## Technical Notes

Build from the pure model in T-007. Avoid charts and progress bars: counts plus direct receipts are the intended information density. Write actions are added only in T-010.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Viewer documentation impact recorded for T-013

## Evidence Log
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
