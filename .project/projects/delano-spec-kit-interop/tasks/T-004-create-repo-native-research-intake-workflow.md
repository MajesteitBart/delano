---
id: T-004
name: Create repo-native research intake workflow
status: ready
workstream: WS-C
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Create repo-native research intake workflow

## Description

Design a Delano-native research step based on the durable plan/findings/progress pattern from planning_with_files.

## Acceptance Criteria

- [ ] Research artifacts have a defined location and lifecycle.
- [ ] The workflow includes fold-forward rules into `spec.md` and `plan.md`.
- [ ] No dependency on Obsidian, OpenClaw, or private skill paths is introduced.

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
