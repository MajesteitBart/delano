---
id: T-002
name: Make markdown reader annotation-aware
status: ready
workstream: WS-B
created: 2026-06-30T14:12:02Z
updated: 2026-06-30T14:24:00Z
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

- [ ] Selecting text in project/context markdown opens a compact annotation toolbar and creates a comment or quick-label draft.
- [ ] Annotations restore against quote plus line/block context after reload and degrade to drawer-only when the anchor is stale.
- [ ] Browser smoke coverage verifies selection, highlight, drawer focus, and stale-anchor behavior.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Plannotator's `packages/ui/hooks/useAnnotationHighlighter.ts` shows a useful text restoration pattern: exact match first, then normalized text fallback, then stale/unresolved state.
- The current Delano viewer renders markdown through generated HTML; implementation should first expose stable block/line anchors instead of layering fragile DOM offsets over arbitrary HTML.
- Tablet readability remains a regression guard because earlier side panels made document content too narrow.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-30T14:12:02Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from Plannotator highlight behavior and current viewer layout constraints.
