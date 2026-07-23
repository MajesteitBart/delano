---
id: T-006
name: Write first-15-minutes onboarding path
status: done
workstream: WS-D
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-003]
conflicts_with: []
parallel: true
priority: medium
estimate: M
---

# Task: Write first-15-minutes onboarding path

## Description

Create public-facing docs that guide a new user from idea to validated Delano project.

## Acceptance Criteria

- [x] Guide starts with a plain idea and ends with valid `.project` artifacts.
- [x] Guide explains Spec Kit complementarity in simple language.
- [x] Guide references validation and evidence gates.

## Technical Notes

- Source plan: `docs/plans/spec-kit-integration-plan.md`.
- Preserve Delano's evidence, validation, sync, multi-agent, and closeout semantics.
- Keep generated/public artifacts portable and free of private local path references.

## Definition of Done

- [x] Implementation or documentation complete.
- [x] Delano validation passes.
- [x] Relevant tests or text safety checks pass.
- [x] Evidence is recorded in this task or an update note.
- [x] Docs are updated where user-facing behavior changes.

## Evidence Log

- 2026-05-10T09:02:02Z: Task created from Spec Kit integration plan conversion.
- 2026-05-10T12:13:00Z: Added `docs/first-15-minutes.md` and linked it from `README.md` and `docs/user-guide.md`. Guide starts from a plain idea, covers Spec Kit import/direct Delano init/research intake, and ends with validation plus evidence gates.
