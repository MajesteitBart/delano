---
id: T-004
name: Create repo-native research intake workflow
status: done
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

- [x] Research artifacts have a defined location and lifecycle.
- [x] The workflow includes fold-forward rules into `spec.md` and `plan.md`.
- [x] No dependency on Obsidian, OpenClaw, or private skill paths is introduced.

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
- 2026-05-10T11:47:00Z: Added repo-native research intake workflow: `docs/research-intake.md`, `delano research`, `.agents/scripts/pm/research.sh`, packaged payload entry, CLI help/tests, and user docs. Smoke-tested JSON output and verified created research files.
