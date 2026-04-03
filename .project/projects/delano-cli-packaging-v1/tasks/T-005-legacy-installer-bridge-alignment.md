---
id: T-005
name: Legacy installer bridge alignment
status: backlog
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:00:36Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: true
priority: medium
estimate: S
---

# Task: Legacy installer bridge alignment

## Description

Keep `install-delano.sh` working as a migration bridge while aligning its messaging and role with the new npm CLI path.

## Acceptance Criteria
- [ ] `install-delano.sh` remains usable after the CLI packaging changes land.
- [ ] Bridge messaging clearly differentiates the legacy shell installer from the npm CLI install path.
- [ ] No new default behavior in the shell installer contradicts the safer npm install contract.
- [ ] Any delegation or compatibility notes are documented in the script help or surrounding docs.

## Technical Notes

- Preserve the script unless there is a clear and justified replacement, which is not expected in this scope.
- Changes here should be minimal and should not expand the shell installer surface.
- Keep the bridge role subordinate to the new CLI direction rather than creating parallel product promises.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
