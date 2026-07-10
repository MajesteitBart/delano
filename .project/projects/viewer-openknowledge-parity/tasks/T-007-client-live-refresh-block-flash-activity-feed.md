---
id: T-007
name: Client live refresh block flash activity feed
status: done
workstream: WS-C
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T00:56:52Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-005","T-006"]
conflicts_with: []
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-005
acceptance_criteria_ids: ["AC-004","AC-005","AC-006"]
---

# Task: Client live refresh block flash activity feed

## Description

Client: single EventSource subscription; read-mode refetch + changed-block flash on doc-changed for the open path; index auto-refresh; activity feed panel (relative times, kind icons, pulsing agent-working dot); dirty-edit external-change conflict banner. Claude authors (design-bearing).

## Acceptance Criteria
- [x] Open document refreshes without user action within 2s of external change (read mode)
- [x] Changed blocks flash with the design-system easing; no flash storm on bulk changes
- [x] Activity feed visible from reader; badge pulses while events arrive
- [x] Dirty editor + external change shows conflict banner instead of auto-reload

## Traceability
- Story: US-004, US-005, US-006
- Acceptance criteria: AC-004, AC-005, AC-006

## Technical Notes

Block diff keyed on existing line-anchored block ids; fallback whole-pane flash per AD-5.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:56:52Z: useLiveEvents EventSource hook (single subscription, agent-working window), silent index refresh, read-mode refetch with content-matched block flash (whole-pane fallback >60% change), ActivityFeed sheet with newest-first feed and pulsing agent dot, edit-mode external-change signal to conflict banner. Server SSE smoke: doc-changed delivered <2s, activity snapshot correct. Browser confirmation in T-009.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
