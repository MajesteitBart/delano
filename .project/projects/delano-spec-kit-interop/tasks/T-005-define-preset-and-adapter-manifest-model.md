---
id: T-005
name: Define preset and adapter manifest model
status: ready
workstream: WS-D
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: M
---

# Task: Define preset and adapter manifest model

## Description

Define how Delano can describe agent integrations, workflow presets, install categories, and validation fixtures.

## Acceptance Criteria

- [ ] A manifest proposal lists fields, ownership, generated files, and validation expectations.
- [ ] At least two example presets are described.
- [ ] Install/update conflict behavior is preserved.

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
