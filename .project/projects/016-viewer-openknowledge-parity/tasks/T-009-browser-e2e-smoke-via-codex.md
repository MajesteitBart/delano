---
id: T-009
name: Browser E2E smoke via Codex
status: done
workstream: WS-D
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T01:14:49Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-005","T-007","T-008"]
conflicts_with: []
parallel: false
priority: high
estimate: S
operating_mode: feature
story_id: US-006
acceptance_criteria_ids: ["AC-008"]
---

# Task: Browser E2E smoke via Codex

## Description

Codex-run browser E2E smoke per `.agents/rules/browser-delegation.md`: edit->save->disk verify; external modify -> live refresh + flash; dirty conflict banner; handover dispatched state. Screenshots to repo-relative `output/`. One scoped codex exec run per flow.

## Acceptance Criteria
- [x] All four flows pass with screenshots stored under `output/`
- [x] Keyboard reachability of edit/save/escape verified
- [x] Evidence recorded in task log and updates/

## Traceability
- Story: US-006
- Acceptance criteria: AC-008

## Technical Notes

Delegated to Codex (gpt-5.6-sol). Viewer launched locally for the runs.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T01:14:49Z: Codex-run Playwright smoke, all five flows PASS: edit-save-disk (WYSIWYG, locked frontmatter card, Ctrl+S Saved indicator, byte-identical frontmatter prefix on disk), live refresh with md-block-flash in 823ms plus activity sheet entry, dirty-edit conflict banner in 832ms with working Reload latest, keyboard reachability (e, Ctrl+S, two-step Escape), handover menu and dispatched banner. Initial run found the Saved-indicator regression; fixed in DocumentEditor (savedNow state, normalization hint cleared after save) and flow 1 re-run PASS. Screenshots under output/e2e/ (local, gitignored).

- 2026-07-10T00:56:52Z: Task started with `delano task start`.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
