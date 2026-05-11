---
id: T-005
name: Fix table link alignment and overflow
status: ready
workstream: WS-A
created: 2026-05-11T09:52:00Z
updated: 2026-05-11T09:52:00Z
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
- [ ] Link-style buttons inside table/list cells are left-aligned and visually align with plain text cells.
- [ ] Long link labels use a one-line maximum with ellipsis or equivalent truncation.
- [ ] Button underline or border treatment is limited to the text width, not the full cell width.
- [ ] The fix applies consistently to validation tables and similar viewer tables.

## Technical Notes

- Prefer CSS changes to shared link/table classes before adding one-off markup.
- Verify truncation preserves accessible full labels through native title text or another appropriate affordance if needed.
- This task comes from viewer feedback issue 3.

## Definition of Done
- [ ] Implementation complete
- [ ] Browser smoke test covers a long linked table value
- [ ] Review complete
- [ ] Evidence recorded

## Evidence Log
- 2026-05-11T09:52:00Z: Task created from viewer feedback note; implementation evidence pending.
