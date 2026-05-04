---
id: T-008
name: Make PM validation runtime reliable
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
priority: medium
estimate: M
---

# Task: Make PM validation runtime reliable

## Description

Make the documented PM validation command reliable in the supported Windows/local development environment, or document the supported shell entrypoint clearly enough that release gates are reproducible.

## Acceptance Criteria

- [ ] The supported local command for PM validation is explicit.
- [ ] Node-backed validation checks are reachable from that supported command path.
- [ ] Known missing-update or environment-only failures are either fixed or documented as external blockers.
- [ ] Evidence records the PM validation result in the supported environment.

## Technical Notes

- A probe run under Git Bash could not find Node for Node-backed PM validation checks.
- Avoid weakening validation to hide real failures.
- If the fix is documentation-only, state why script behavior is intentionally unchanged.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from reproduced PM validation reliability issue; implementation evidence pending.
