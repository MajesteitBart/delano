---
id: T-001
name: Gate annotations behind explicit Review mode
status: done
workstream: WS-A
created: 2026-07-13T21:59:58Z
updated: 2026-07-13T22:08:31Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-001, US-002
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004]
---

# Task: Gate annotations behind explicit Review mode

## Description

Make Review an explicit reader state. Prevent `MarkdownArticle` from installing annotation selection/highlighting behavior in read mode, keep existing marks hidden until Review, and distinguish writable composition from read-only inspection.

## Acceptance Criteria
- [x] In read mode, mouse and keyboard selection create no annotation mark or composer and preserve native selection.
- [x] Documents with existing annotations begin in read mode with marks and drawer hidden.
- [x] Writable Review paints existing marks and supports the existing create/edit/delete workflow.
- [x] Linked read-only Review paints and opens existing marks but cannot create annotations.
- [x] Closing Review removes review-only marks and dismisses any draft composer without mutating saved annotations.

## Traceability
- Story: US-001, US-002
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004

## Technical Notes

Change the interaction boundary, not the annotation API. Prefer explicit visibility and creation props over callback-only guards so `web-highlighter` never owns ordinary read selection.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs impact completed in T-005

## Evidence Log

- 2026-07-13T22:08:31Z: npm run test:reader: 7/7 passed; npm run typecheck passed; targeted ESLint passed; T3 confirmed read selection preserved with 0 marks/0 popover, existing annotation document opened with Review=false/drawer=false/0 marks, explicit Review painted stored marks and enabled composer.

- 2026-07-13T22:02:08Z: Beginning highest-risk Review interaction boundary implementation.

- 2026-07-13T22:02:07Z: Readiness reviewed: approved spec and plan, complete acceptance criteria, owned source boundaries, no unresolved dependency.
- 2026-07-13T21:59:58Z: Created from .project/templates/task.md by `delano task add`.
