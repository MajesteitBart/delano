---
id: T-003
name: Add viewer Agent menu
status: blocked
workstream: WS-C
created: 2026-06-17T12:38:55Z
updated: 2026-06-17T14:02:00Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001, T-002]
conflicts_with: [.delano/viewer/public/app.jsx, .delano/viewer/public/styles.css]
parallel: true
priority: high
estimate: L
story_id: US-000
acceptance_criteria_ids: [AC-000, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006]
blocked_owner: dependency
blocked_check_back: 2026-06-24
---

# Task: Add viewer Agent menu

## Description

Add an Agent menu to project overview, task detail, and blocked-task contexts with Codex, Claude Code, and Copy prompt options.

## Acceptance Criteria

- [ ] Project overview exposes a generic carry-forward agent action with provider choice and copy fallback.
- [ ] Task detail exposes a generic carry-forward agent action with task ID, project slug, and source path context.
- [ ] Blocked-task context exposes an investigate-blocker action that includes dependency, owner, and check-back guardrails.
- [ ] Top-level UI label is "Agent" or context-specific "Carry forward with agent" / "Investigate blocker with agent"; provider choices are submenu items.
- [ ] Labels use "Open in..." or "Copy prompt"; lifecycle verbs are not top-level button labels.
- [ ] Existing open-in-IDE and open-folder behavior still works.

## Traceability
- Story: US-000
- Acceptance criteria: AC-000, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006

## Technical Notes
- Do not add a global topbar action unless it has concrete project/task/blocker context.
- Prompt text must be inspectable through the copy-prompt fallback.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log

- 2026-06-17T12:41:53Z: Waiting for T-001 and T-002 to define the link builders and prompt templates.
- 2026-06-17T13:46:07Z: Scope narrowed after Oracle review to project overview, task detail, and blocked-task contexts only.
- 2026-06-17T12:38:55Z: Created from .project/templates/task.md by `delano task add`.
