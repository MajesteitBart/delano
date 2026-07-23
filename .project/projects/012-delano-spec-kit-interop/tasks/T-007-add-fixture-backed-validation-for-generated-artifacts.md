---
id: T-007
name: Add fixture-backed validation for generated artifacts
status: done
workstream: WS-E
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002, T-003]
conflicts_with: []
parallel: false
priority: high
estimate: L
---

# Task: Add fixture-backed validation for generated artifacts

## Description

Add tests or validation fixtures proving imported/generated artifacts remain valid Delano projects.

## Acceptance Criteria

- [x] Fixtures cover a happy path and at least one unsupported/clarification path.
- [x] `delano validate`, text safety, and relevant tests pass.
- [x] Evidence is logged before closure.

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
- 2026-05-10T12:28:00Z: Added `scripts/check-spec-kit-interop-fixtures.mjs`, `npm run check:spec-kit-interop`, and a Node test wrapper. The fixture check runs `delano import-spec-kit` and `delano research` in JSON mode, verifies generated files, requires default validation to pass, and cleans up smoke artifacts.
