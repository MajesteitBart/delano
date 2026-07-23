---
id: T-001
name: Replace per-field awk validation with one-pass parsing
status: done
workstream: WS-A
created: 2026-07-14T15:25:25Z
updated: 2026-07-14T15:34:30Z
linear_issue_id:
github_issue: https://github.com/MajesteitBart/delano/issues/25
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
operating_mode: scoped-change
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002]
---

# Task: Replace per-field awk validation with one-pass parsing

## Description

Replace repeated `awk` frontmatter reads in the project-validation phase with one Python invocation, then add generated-portfolio regression coverage and refresh generated runtime artifacts.

## Acceptance Criteria
- [x] A generated 25-project/250-task portfolio validates successfully in under 30 seconds.
- [x] Core validation reports missing required fields, invalid UTC timestamps, missing workstream references, and dependency cycles without per-field subprocesses.
- [x] Existing CRLF validation coverage passes.
- [x] Canonical, compatibility, and packaged validator copies are synchronized.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001, AC-002

## Technical Notes

- Keep one inline Python process inside `validate.sh` to avoid a new runtime asset and preserve the current entrypoint.
- The Python process emits detailed errors and a machine-readable count for the Bash aggregate result.
- Use a generous performance ceiling to detect the Windows regression without measuring micro-optimizations.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-14T15:34:30Z: Closed after quality gate.

- 2026-07-14T15:34:29Z: npm test 120/120; 25-project/250-task validation 8.6s; final validation 0 errors; package-manifest drift and diff check passed.

- 2026-07-14T15:34:20Z: Quality gate passed: `npm test` passed 120/120; focused CRLF, preserved-error, and 25-project/250-task tests passed with the large portfolio at 8.6 seconds; `validate.sh --allow-worktree-state` passed in 5.85 seconds with 0 errors and 1 expected linked-worktree warning; package-manifest drift and `git diff --check` passed.

- 2026-07-14T15:31:42Z: Implementation complete and entering quality verification.

- 2026-07-14T15:25:54Z: Starting dependency-safe implementation for GitHub issue #25.

- 2026-07-14T15:25:51Z: Readiness reviewed: scope, acceptance criteria, dependencies, ownership, and rollback are explicit.
- 2026-07-14T15:25:25Z: Created from .project/templates/task.md by `delano task add`.
