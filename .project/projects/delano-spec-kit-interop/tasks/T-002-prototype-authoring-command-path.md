---
id: T-002
name: Prototype authoring command path
status: blocked
workstream: WS-A
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: false
blocked_owner: delano-team
blocked_check_back: 2026-05-11T09:00:00Z
priority: high
estimate: L
---

# Task: Prototype authoring command path

## Description

Build or document the smallest `discover/clarify/plan/tasks` path that creates valid Delano artifacts from an idea or fixture.

## Acceptance Criteria

- [ ] A first command/script/agent workflow creates or updates a Delano project scaffold.
- [ ] Generated artifacts pass validation.
- [ ] The workflow does not bypass `.project` or `HANDBOOK.md` contracts.

## Technical Notes

- Source plan: `docs/plans/spec-kit-integration-plan.md`.
- Preserve Delano's evidence, validation, sync, multi-agent, and closeout semantics.
- Keep generated/public artifacts portable and free of private local path references.

## Definition of Done

- [ ] Implementation or documentation complete.
- [ ] Delano validation passes.
- [ ] Relevant tests or text safety checks pass.
- [ ] Evidence is recorded in this task or an update note.
- [ ] Docs are updated where user-facing behavior changes.

## Evidence Log

- 2026-05-10T09:02:02Z: Task created from Spec Kit integration plan conversion.

## Blocker

Blocked until prerequisite local Delano task dependencies are completed.
