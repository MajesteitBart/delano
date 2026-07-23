---
id: T-006
name: Server watcher SSE and activity buffer
status: done
workstream: WS-C
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T00:45:04Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-002","T-003"]
conflicts_with: []
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: ["AC-004"]
---

# Task: Server watcher SSE and activity buffer

## Description

Server: recursive fs.watch on `.project` (250ms debounce), `GET /api/events` SSE (index-changed, doc-changed{path,kind}, heartbeat 25s), in-memory activity ring buffer (cap 200) + `GET /api/activity` snapshot. Connection cleanup on close. Codex implements per AD-4/AD-7.

## Acceptance Criteria
- [x] SSE stream delivers doc-changed within 2s of an external write
- [x] Debounce collapses burst writes to <=1 event per file per window
- [x] Activity snapshot returns newest-first capped list
- [x] No watcher/SSE resource leaks after client disconnect (test or scripted check)
- [x] `npm test` green including new server tests

## Traceability
- Story: US-004
- Acceptance criteria: AC-004

## Technical Notes

No new dependencies (stdlib only). Sequenced after T-003 on server.js.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:45:04Z: Codex implemented watcher snapshot diffing with 250ms debounce and polling fallback, /api/events SSE with heartbeat and cleanup, /api/activity ring buffer (cap 200); node --check passed; viewer tests 10/10; full npm test 108/108 after contract fixes.

- 2026-07-10T00:35:16Z: Task started with `delano task start`.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
