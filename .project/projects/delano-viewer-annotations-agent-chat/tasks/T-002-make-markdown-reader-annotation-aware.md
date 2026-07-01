---
id: T-002
name: Make markdown reader annotation-aware
status: done
workstream: WS-B
created: 2026-06-30T14:12:02Z
updated: 2026-06-30T14:55:27Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: false
priority: high
estimate: XL
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Make markdown reader annotation-aware

## Description

Refactor the document reader so rendered markdown exposes stable line/block anchors, selection capture, inline markers, and drawer synchronization.

## Acceptance Criteria

- [x] Selecting text in project/context markdown opens a compact annotation toolbar and creates a comment or quick-label draft.
- [x] Annotations restore against quote plus line/block context after reload and degrade to drawer-only when the anchor is stale.
- [x] Browser smoke coverage verifies selection, highlight, drawer focus, and stale-anchor behavior.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Plannotator's `packages/ui/hooks/useAnnotationHighlighter.ts` shows a useful text restoration pattern: exact match first, then normalized text fallback, then stale/unresolved state.
- The current Delano viewer renders markdown through generated HTML; implementation should first expose stable block/line anchors instead of layering fragile DOM offsets over arbitrary HTML.
- Tablet readability remains a regression guard because earlier side panels made document content too narrow.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T14:55:27Z: Rendered markdown blocks carry stable block and line metadata, selection creates annotations, exact quotes highlight inline, stale anchors render in the drawer, and Chrome smoke verified 1024x768 readable layout with no overflow.

- 2026-06-30T14:55:21Z: Annotation API foundation is done; reader interaction behavior is implemented and browser-smoked.
- 2026-06-30T14:12:02Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from Plannotator highlight behavior and current viewer layout constraints.
