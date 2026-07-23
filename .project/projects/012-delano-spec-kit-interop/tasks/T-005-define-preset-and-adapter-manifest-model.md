---
id: T-005
name: Define preset and adapter manifest model
status: done
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

- [x] A manifest proposal lists fields, ownership, generated files, and validation expectations.
- [x] At least two example presets are described.
- [x] Install/update conflict behavior is preserved.

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
- 2026-05-10T12:02:00Z: Added `docs/presets-and-adapters.md`, adapter manifest schema proposal, and experimental Spec Kit adapter manifest. Documented Spec Kit interop, prototype-first, and enterprise-audit preset examples while preserving Delano conflict-first install semantics.
