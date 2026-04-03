---
id: T-004
name: Wrapper commands for PM scripts
status: review
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:18:28Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Wrapper commands for PM scripts

## Description

Implement `delano init`, `delano validate`, `delano status`, and `delano next` as thin wrappers over the current `.agents/scripts/pm/*` commands.

## Acceptance Criteria
- [x] Each wrapper command delegates to the existing PM script instead of reimplementing its core logic.
- [x] The CLI resolves a usable `bash` and Python-backed runtime path in the current Windows-first environment assumptions.
- [x] Wrapper command exit codes and stdout/stderr behavior remain faithful enough to the current scripts for operator use.
- [x] Command help or usage text makes the wrapper role explicit.

## Technical Notes

- Treat existing script behavior as the source of truth; only normalize output intentionally.
- Review `status.sh` behavior during implementation because the wrapper will expose it directly.
- Keep write ownership inside CLI source files and avoid editing PM scripts unless wrapper compatibility forces a targeted fix.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Implemented wrapper commands for `init`, `validate`, `status`, and `next`, with repo-root discovery and bash resolution. Smoke-tested wrappers in both the source repo and an installed scratch repo.
