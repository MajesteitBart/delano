---
id: T-002
name: Watcher reliability spot-check on win32
status: done
workstream: WS-A
created: 2026-07-09T23:58:19Z
updated: 2026-07-10T00:34:12Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: S
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: ["AC-004"]
---

# Task: Watcher reliability spot-check on win32

## Description

Spot-check recursive fs.watch on `.project` under win32: single-file save, agent-style rapid writes, bulk change (git checkout), delete/rename. Confirms AD-4 or triggers the polling fallback.

## Acceptance Criteria
- [x] Scripted check exercises save, burst-write, bulk, delete scenarios on win32
- [x] Observed event latency supports the 2s freshness budget (SM-3)
- [x] Go/no-go on fs.watch vs polling fallback recorded in decisions.md

## Traceability
- Story: US-004
- Acceptance criteria: AC-004

## Technical Notes

Plain node script; no UI. Delegate to Codex.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:34:12Z: Codex-run watch-probe.mjs on win32: PASS, all scenarios <=7ms latency; bulk ops coalesce so watcher uses debounced rescan (D-004).

- 2026-07-10T00:13:44Z: Task started with `delano task start`.
- 2026-07-09T23:58:19Z: Created from .project/templates/task.md by `delano task add`.
