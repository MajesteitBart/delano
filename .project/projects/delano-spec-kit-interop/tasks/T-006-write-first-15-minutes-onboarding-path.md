---
id: T-006
name: Write first-15-minutes onboarding path
status: blocked
workstream: WS-D
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-003]
conflicts_with: []
parallel: true
blocked_owner: delano-team
blocked_check_back: 2026-05-11T09:00:00Z
priority: medium
estimate: M
---

# Task: Write first-15-minutes onboarding path

## Description

Create public-facing docs that guide a new user from idea to validated Delano project.

## Acceptance Criteria

- [ ] Guide starts with a plain idea and ends with valid `.project` artifacts.
- [ ] Guide explains Spec Kit complementarity in simple language.
- [ ] Guide references validation and evidence gates.

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
