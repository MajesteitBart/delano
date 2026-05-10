---
id: T-003
name: Upgrade templates for spec-first traceability
status: done
workstream: WS-B
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Upgrade templates for spec-first traceability

## Description

Extend templates to carry user stories, acceptance scenarios, success criteria, assumptions, clarification markers, and task traceability.

## Acceptance Criteria

- [x] Template changes preserve existing required fields.
- [x] Task templates support story/acceptance traceability without breaking validation.
- [x] Docs explain how generated Spec Kit-style intent maps to Delano contracts.

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
