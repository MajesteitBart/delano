---
id: T-012
name: Enforce ready dependencies strictly
status: done
workstream: WS-C
created: 2026-05-04T10:02:29Z
updated: 2026-05-04T10:04:33Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: S
---

# Task: Enforce ready dependencies strictly

## Description

Make existing `ready` task artifacts with unresolved local dependencies fail status-transition validation instead of warning.

## Acceptance Criteria
- [x] Current artifact scans fail for unresolved dependencies on `ready` tasks.
- [x] Proposed transitions remain strict for `ready`, `in-progress`, and `done`.
- [x] Regression coverage proves an existing `ready` task with an unresolved dependency fails validation.
- [x] Handbook text matches strict release behavior.

## Technical Notes
- This closes the remaining dependency-enforcement gap noted in review feedback.
- The checker now supports `--projects-root` so tests can use isolated fixture projects.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T10:02:29Z: Updated status-transition checkers and handbook text for strict `ready` dependency enforcement; added isolated regression coverage.
- 2026-05-04T10:04:33Z: `npm test` passed with 50 tests, including the regression that existing `ready` tasks with unresolved dependencies fail validation; `bash .agents/scripts/pm/validate.sh` passed with Errors: 0 and Warnings: 0.
