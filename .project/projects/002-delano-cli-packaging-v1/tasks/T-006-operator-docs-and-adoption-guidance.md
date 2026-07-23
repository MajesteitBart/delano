---
id: T-006
name: Operator docs and adoption guidance
status: done
workstream: WS-D
created: 2026-04-03T12:00:36Z
updated: 2026-04-28T22:08:32Z
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
- [x] `README.md` and `docs/user-guide.md` reflect the actual npm CLI command surface and install behavior.
- [x] Documentation does not imply that top-level adapter entry docs are installed by default in the npm base install path.
- [x] Guidance distinguishes between `delano install` and the legacy shell installer bridge.
- [x] Examples and terminology stay aligned with the handbook and `.agents`-canonical runtime model.

## Technical Notes

- Focus on operator-facing accuracy rather than broad marketing copy.
- Keep documentation updates downstream of finalized install and wrapper behavior.
- If package-specific usage docs are added, ensure they do not contradict repository-root guidance.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Updated `README.md` and `docs/user-guide.md` to document the npm CLI surface, conservative install behavior, wrapper commands, and the legacy role of `install-delano.sh`.
- 2026-04-28: Marked done after operator confirmation and final package verification rerun.
