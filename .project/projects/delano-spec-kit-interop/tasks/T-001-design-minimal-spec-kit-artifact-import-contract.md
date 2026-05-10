---
id: T-001
name: Design minimal Spec Kit artifact import contract
status: ready
workstream: WS-A
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

# Task: Design minimal Spec Kit artifact import contract

## Description

Define the accepted input shapes and normalization rules for Spec Kit-style specs, plans, and task lists.

## Acceptance Criteria

- [ ] Import contract documents source artifact types, target Delano files, field mappings, and unsupported cases.
- [ ] At least one fixture shape is selected for a first probe.
- [ ] Private/local environment assumptions are explicitly excluded.

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
