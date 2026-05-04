---
id: T-007
name: Fix current npm test failures
status: done
workstream: WS-D
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Fix current npm test failures

## Description

Repair the currently failing `npm test` cases discovered while checking the unresolved review blockers.

## Acceptance Criteria

- [x] Drift-report tests no longer fail with JSON parsing errors.
- [x] Context-audit path assertions match the script's intended JSON output shape.
- [x] `npm test` passes after the fixes.
- [x] Evidence records the failing baseline and passing validation command.

## Technical Notes

- Inspect `test/package.test.js`, `scripts/build-drift-report.mjs`, and `scripts/check-context-audit.mjs`.
- Keep script output modes explicit so JSON tests parse JSON-only output.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from reproduced `npm test` failures in drift-report and context-audit coverage; implementation evidence pending.
- 2026-05-04T09:35:25Z: Fixed Windows direct-run detection in drift-report scripts and normalized context-audit paths to POSIX repo paths. Validation passed: `npm test` with 47 passing tests.
