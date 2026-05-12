---
id: T-005
name: Fix table link alignment and overflow
status: done
workstream: WS-A
created: 2026-05-11T09:52:00Z
updated: 2026-05-11T15:25:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: false
priority: medium
estimate: S
---

# Task: Fix table link alignment and overflow

## Description

Clean up table cells that render links as buttons so multi-line content does not center-align awkwardly or create full-width underlines.

## Acceptance Criteria
- [x] Link-style buttons inside table/list cells are left-aligned and visually align with plain text cells.
- [x] Long link labels use a one-line maximum with ellipsis or equivalent truncation.
- [x] Button underline or border treatment is limited to the text width, not the full cell width.
- [x] The fix applies consistently to validation tables and similar viewer tables.

## Technical Notes

- Prefer CSS changes to shared link/table classes before adding one-off markup.
- Verify truncation preserves accessible full labels through native title text or another appropriate affordance if needed.
- This task comes from viewer feedback issue 3.

## Definition of Done
- [x] Implementation complete
- [x] Browser smoke test covers a long linked table value
- [x] Review complete
- [x] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
- 2026-05-11T15:25:00Z: Added shared link-button rendering and CSS truncation rules in `.delano/viewer/public/app.jsx` and `.delano/viewer/public/styles.css`. Browser smoke on the workspace Validation table confirmed linked task text is `inline-block`, `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`, and has a native `title` label for the full value. Console errors: 0.
