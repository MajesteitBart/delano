---
name: Viewer Review Mode and Project Dashboard
slug: viewer-review-dashboard
owner: bart
created: 2026-07-13T21:53:24Z
updated: 2026-07-13T22:27:08Z
---

# Decisions: Viewer Review Mode and Project Dashboard

## Active Decisions

- Review is an explicit document mode. Reading mode installs no annotation selection handler or highlighter, regardless of stored annotation count.
- Review visibility and creation permission are separate capabilities so linked worktrees can inspect existing annotations without gaining a write path.
- The review drawer remains a fixed overlay. The reader reserves no compensating width or padding when Review opens.
- Project overview visualizes current indexed delivery state only. It uses a segmented task-state execution map, workstream progress, the canonical spec brief, and timestamped progress evidence rather than fabricating historical trends or forecasts.
- Dashboard drilldowns use existing document, task, and workstream routes; no new analytics endpoint or persisted dashboard state is introduced.

## Superseded Decisions
- None.

## Open Decision Questions

- None.
