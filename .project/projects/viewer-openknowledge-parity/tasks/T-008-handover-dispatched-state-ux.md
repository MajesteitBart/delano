---
id: T-008
name: Handover dispatched-state UX
status: done
workstream: WS-D
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T00:56:52Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-007"]
conflicts_with: []
parallel: false
priority: medium
estimate: S
operating_mode: feature
story_id: US-005
acceptance_criteria_ids: ["AC-007"]
---

# Task: Handover dispatched-state UX

## Description

Handover flow ends in a visible dispatched state: confirmation surface with agent/intent, link/attention cue to the activity feed, live feed shows subsequent agent writes. Claude authors.

## Acceptance Criteria
- [x] Dispatch shows a persistent dispatched indicator (not just a transient toast)
- [x] Activity feed is one gesture away from the dispatched state
- [x] Agent file events appear in the feed after dispatch (verified with a scripted external writer)

## Traceability
- Story: US-005
- Acceptance criteria: AC-007

## Technical Notes

No change to handover write boundaries; UI-only plus reuse of T-006 events.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:56:52Z: HandoverMenu onDispatched emits agent/intent/at; persistent dispatched banner in reader with agent dot, live-changes note, View activity opening the controlled activity sheet, dismissible. Browser confirmation in T-009.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
