---
id: T-006
name: Document agent button behavior
status: blocked
workstream: WS-D
created: 2026-06-17T12:39:26Z
updated: 2026-06-17T14:02:00Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-003, T-005]
conflicts_with: [docs/viewer-guide.md, docs/cli-reference.md, README.md]
parallel: true
priority: medium
estimate: S
story_id: US-003
acceptance_criteria_ids: [AC-003, AC-004, AC-005, AC-006, AC-007]
blocked_owner: dependency
blocked_check_back: 2026-06-24
---

# Task: Document agent button behavior

## Description

Update Delano viewer and CLI docs to explain agent buttons, deeplink requirements, safety guardrails, and fallback behavior.

## Acceptance Criteria

- [ ] Docs explain Codex and Claude Code deep link requirements and that prompts are prefilled, not auto-executed.
- [ ] Docs list the v1 surfaces: project overview, task detail, and blocked-task contexts.
- [ ] Docs explain that lifecycle-specific buttons are intentionally out of v1.
- [ ] Docs include fallback guidance for environments that strip custom URL schemes.
- [ ] Docs explain that generated absolute local provider URLs are local-only and must not be copied into public docs/issues.

## Traceability
- Story: US-003
- Acceptance criteria: AC-003, AC-004, AC-005, AC-006, AC-007

## Technical Notes
- Use sanitized path placeholders in examples.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log

- 2026-06-17T13:46:07Z: Dependency updated after lifecycle presets moved out of v1; docs now wait on UI placement and validation evidence.
- 2026-06-17T12:39:26Z: Created from .project/templates/task.md by `delano task add`.
