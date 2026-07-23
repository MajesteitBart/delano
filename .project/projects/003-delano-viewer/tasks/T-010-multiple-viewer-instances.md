---
id: T-010
name: Multiple viewer instances
status: done
workstream: WS-A
created: 2026-05-08T11:27:10Z
updated: 2026-05-08T11:27:10Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: false
priority: medium
estimate: S
---

# Task: Multiple viewer instances

## Description

Allow multiple Delano viewer servers to run at the same time. When the configured starting port is already in use, the viewer should try subsequent ports and report the actual URL that was bound.

## Acceptance Criteria
- [x] Viewer startup treats `DELANO_VIEWER_PORT`, `PORT`, or `3977` as the starting port.
- [x] If the starting port is occupied, startup tries the next available port instead of failing.
- [x] Startup output reports the actual URL and notes when the requested starting port was unavailable.
- [x] Automated coverage verifies fallback behavior with an occupied port.
- [x] Viewer README and CLI help describe the starting-port behavior.

## Technical Notes

- Implemented in `.delano/viewer/server.js` with bounded `EADDRINUSE` retry behavior.
- Added `test/viewer-server.test.js` to occupy a port and assert the viewer binds above it.
- The active globally installed viewer copy was patched locally so the already-installed `delano viewer` command can start another instance immediately.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-08: Manual probe with an existing viewer on `3977` started another repo server, which bound `3978` and printed `Delano read-only viewer: http://127.0.0.1:3978 (3977 was unavailable)`.
- 2026-05-08: `node --test test/viewer-server.test.js` passed.
- 2026-05-08: `npm test` passed with 58 tests.
- 2026-05-08: `npm run build:assets` passed.
- 2026-05-08: `npm run check:package-manifest` passed.
