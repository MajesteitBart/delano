---
id: T-008
name: Compose the board archive and source navigation
status: done
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T12:43:22Z
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

- [x] Workspace navigation exposes Roadmap only from the indexed roadmap capability and shows an adoption empty state when no item exists.
- [x] Desktop and narrow layouts render `now`, `next`, and `later` lanes without horizontal page overflow; terminal items are available through an archive control.
- [x] Each card shows item intent, status, linked project-state counts, done/open/blocked task totals, latest canonical activity, and staleness reasons from the board model.
- [x] Item and linked-project controls navigate to the canonical source documents.
- [x] Advisory staleness is visually/textually distinct from blocked or invalid lifecycle status.
- [x] Every read interaction is keyboard reachable, and understanding the board does not depend on drag-and-drop or color alone.
- [x] Focused component/source tests cover empty, single-lane, mixed, archived, stale, blocked, long-title, and narrow states.

## Traceability
- Story: US-002,US-005,US-007
- Acceptance criteria: AC-006, AC-009

## Technical Notes

Build from the pure model in T-007. Avoid charts and progress bars: counts plus direct receipts are the intended information density. Write actions are added only in T-010.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Viewer documentation impact recorded for T-013

## Evidence Log

- 2026-07-24T12:25:02Z: Roadmap workspace view added: capability-gated nav (availableWorkspaceNav filters when index.roadmap absent), RoadmapBoardPage renders now/next/later lanes with honest empty lanes, archive toggle for terminal items, contract-attention section distinct from advisory staleness (role=alert vs role=note with Advisory prefix and icon), receipt facts (project states, done/open/blocked totals, last activity), source navigation to item and linked-project docs, keyboard-only interactions with no drag. Evidence: ui test:roadmap 7/7, test:domain pass, test:dashboard 3/3, test:reader 9/9, test:editor 5/5, dataTableOptions 8/8, tsc --noEmit clean, eslint clean on changed files; contextSwitcher.test.mjs failure and 8 eslint errors reproduce on pristine base (pre-existing, unrelated).

- 2026-07-24T12:17:04Z: Dependency-safe: T-007 board model is done
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
