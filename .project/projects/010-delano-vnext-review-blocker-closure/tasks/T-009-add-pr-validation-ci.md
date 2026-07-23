---
id: T-009
name: Add PR validation CI
status: done
workstream: WS-D
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-004, T-007, T-008]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Add PR validation CI

## Description

Add a GitHub Actions validation workflow that runs release-blocking checks on pull requests and manual dispatch.

## Acceptance Criteria

- [x] A CI workflow runs `npm test`.
- [x] The workflow runs package asset build or package-manifest drift checks.
- [x] The workflow runs PM validation or the documented supported equivalent.
- [x] The workflow includes path/log safety coverage either through PM validation or focused commands.
- [x] CI setup does not require secrets for read-only validation.
- [x] Evidence records a workflow run or local workflow-equivalent validation if repository execution is unavailable.

## Technical Notes

- Move this task to `ready` after local gates are green enough for CI enforcement.
- Existing workflow coverage is publish-oriented and manually triggered; this task adds PR validation.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved CI blocker; implementation evidence pending.
- 2026-05-04T09:35:25Z: Added `.github/workflows/validate.yml` to run build assets, package-manifest drift, npm tests, and PM validation on pull requests, selected pushes, and manual dispatch. Local workflow-equivalent validation passed: `npm run build:assets`; `npm run check:package-manifest`; `npm test`; `bash .agents/scripts/pm/validate.sh`.
