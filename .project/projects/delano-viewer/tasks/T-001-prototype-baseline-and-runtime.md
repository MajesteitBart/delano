---
id: T-001
name: Prototype baseline and runtime
status: done
workstream: WS-A
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Prototype baseline and runtime

## Description

Capture and verify the already-built local viewer runtime: server entrypoint, package script, default port, static assets, and basic read-only document APIs.

## Acceptance Criteria
- [x] `.delano/viewer/server.js` exists and starts a local HTTP server.
- [x] `package.json` exposes `npm run viewer`.
- [x] The default URL is `http://127.0.0.1:3977`.
- [x] `/api/index` returns a project/document index.
- [x] The server reads `.project` markdown without writing delivery state.

## Technical Notes

- This task records work that was implemented before formal project tracking was created.
- Keep the runtime isolated from core CLI behavior.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Existing files confirmed: `.delano/viewer/server.js`, `.delano/viewer/public/index.html`, `.delano/viewer/public/app.js`, `.delano/viewer/public/styles.css`, and `.delano/viewer/README.md`.
- 2026-04-28: `npm run viewer` was started locally and `/api/index` returned HTTP 200 with JSON content.
- 2026-04-28: Marked done after operator confirmation.
