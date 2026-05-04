---
id: T-007
name: Fix current npm test failures
status: ready
workstream: WS-D
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
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

- [ ] Drift-report tests no longer fail with JSON parsing errors.
- [ ] Context-audit path assertions match the script's intended JSON output shape.
- [ ] `npm test` passes after the fixes.
- [ ] Evidence records the failing baseline and passing validation command.

## Technical Notes

- Inspect `test/package.test.js`, `scripts/build-drift-report.mjs`, and `scripts/check-context-audit.mjs`.
- Keep script output modes explicit so JSON tests parse JSON-only output.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from reproduced `npm test` failures in drift-report and context-audit coverage; implementation evidence pending.
