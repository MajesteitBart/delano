---
id: T-005
name: Save and conflict UX
status: done
workstream: WS-B
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T00:56:52Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-003","T-004"]
conflicts_with: []
parallel: false
priority: high
estimate: S
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: ["AC-002","AC-006"]
---

# Task: Save and conflict UX

## Description

Save flow: Cmd/Ctrl+S + Save button with dirty indicator; success toast (sonner-style); 409 -> conflict banner with reload-theirs / keep-mine-and-retry; external change while dirty -> same banner (with T-007 events). Claude authors.

## Acceptance Criteria
- [x] Save shortcut and button both post baseHash and update it from the response
- [x] 409 shows conflict banner; no silent overwrite path exists
- [x] Dirty indicator visible; leaving edit mode with unsaved changes prompts
- [x] Toast + banner styling matches existing design system

## Traceability
- Story: US-003, US-006
- Acceptance criteria: AC-002, AC-006

## Technical Notes

Banner component reusable for T-007 external-change case.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:56:52Z: Save via Ctrl/Cmd+S and Save button posting expectedHash to /api/apply (reason: editor save); server smoke: fresh hash saved ok, stale hash returned 409 with no write; conflict banner with Reload latest / Keep mine; dirty indicator, two-step Escape discard, Saved state. typecheck+lint+build green. Browser confirmation in T-009.

- 2026-07-10T00:45:24Z: Task started with `delano task start`.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
