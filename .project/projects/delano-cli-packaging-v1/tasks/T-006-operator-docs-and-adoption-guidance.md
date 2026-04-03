---
id: T-006
name: Operator docs and adoption guidance
status: backlog
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:00:36Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-004, T-005]
conflicts_with: []
parallel: true
priority: medium
estimate: M
---

# Task: Operator docs and adoption guidance

## Description

Update operator-facing documentation so the npm CLI install path, wrapper commands, opt-in adapter entrypoint rule, and legacy bridge behavior are all described accurately.

## Acceptance Criteria
- [ ] `README.md` and `docs/user-guide.md` reflect the actual npm CLI command surface and install behavior.
- [ ] Documentation does not imply that top-level adapter entry docs are installed by default in the npm base install path.
- [ ] Guidance distinguishes between `delano install` and the legacy shell installer bridge.
- [ ] Examples and terminology stay aligned with the handbook and `.agents`-canonical runtime model.

## Technical Notes

- Focus on operator-facing accuracy rather than broad marketing copy.
- Keep documentation updates downstream of finalized install and wrapper behavior.
- If package-specific usage docs are added, ensure they do not contradict repository-root guidance.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
