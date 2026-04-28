---
id: T-005
name: Quality gates and browser smoke
status: done
workstream: WS-D
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002, T-003, T-004, T-007, T-008]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Quality gates and browser smoke

## Description

Run and record the quality checks needed before closing the viewer project, including syntax checks, repository tests, PM validation, API smoke checks, markdown rendering compatibility checks, and a browser/visual pass.

## Acceptance Criteria
- [x] `node --check .delano/viewer/server.js` passes.
- [x] `node --check .delano/viewer/public/app.js` passes.
- [x] `npm test` passes.
- [x] `bash .agents/scripts/pm/validate.sh` passes after creating this project.
- [x] A local viewer API smoke check passes.
- [x] Desktop and narrow viewport visual checks are completed or a blocker is documented.
- [x] Markdown compatibility samples for T-007 are verified after implementation.
- [x] Final design polish from T-008 is verified after design input is received and applied.

## Technical Notes

- The viewer was already smoke-tested on `/api/index` after updating the branch from `main`.
- This task should collect the final evidence in one place before closeout.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Initial server smoke before project creation confirmed `/api/index` returned HTTP 200 while the viewer was running on `3977`.
- 2026-04-28: Ran `node --check .delano/viewer/server.js`, `node --check .delano/viewer/public/app.js`, `npm test`, and `bash .agents/scripts/pm/validate.sh`; all passed. `npm test` reported 11 passing tests.
- 2026-04-28: Re-ran `npm test` through `bash .agents/scripts/test-and-log.sh npm test`; test log saved at `.agents/logs/tests/20260428T184721Z.log`.
- 2026-04-28: API smoke checks passed for `/api/index` and `/api/doc?path=projects%2Fdelano-viewer%2Fspec.md`.
- 2026-04-28: Browser smoke opened the viewer, selected the `Delano Viewer` project, confirmed status filters and project outline were visible, and captured `output/playwright/viewer-desktop.png` plus `output/playwright/viewer-mobile.png`.
- 2026-04-28: Browser console was clean after adding a `204` response for `/favicon.ico`.
- 2026-04-28: Reopened task as the final quality gate after adding T-007 markdown compatibility and T-008 design polish as dependencies.
- 2026-04-28: Verified T-008 minimalist-ui redesign with desktop, wide desktop, and narrow viewport screenshots plus zero browser console errors. T-005 remains open because T-007 markdown compatibility is not complete.
- 2026-04-28: Final rerun passed: `node --check .delano/viewer/server.js`, `node --check .delano/viewer/public/app.js`, `npm test` (11/11), and `bash .agents/scripts/pm/validate.sh`.
- 2026-04-28: Final API smoke on port `3988` returned 5 projects and 74 docs from `/api/index`; `context/viewer-markdown-samples.md` returned through `/api/doc` with Mermaid fence, checklist items, and GFM table rows intact; invalid `/api/open` path returned 404.
- 2026-04-28: Final browser smoke captured `output/playwright/viewer-final-smoke-wait.png` and `output/playwright/viewer-final-mobile-smoke-wait.png` after waiting for `.doc` to render.
