---
id: T-009
name: Add PR validation CI
status: deferred
workstream: WS-D
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
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

- [ ] A CI workflow runs `npm test`.
- [ ] The workflow runs package asset build or package-manifest drift checks.
- [ ] The workflow runs PM validation or the documented supported equivalent.
- [ ] The workflow includes path/log safety coverage either through PM validation or focused commands.
- [ ] CI setup does not require secrets for read-only validation.
- [ ] Evidence records a workflow run or local workflow-equivalent validation if repository execution is unavailable.

## Technical Notes

- Move this task to `ready` after local gates are green enough for CI enforcement.
- Existing workflow coverage is publish-oriented and manually triggered; this task adds PR validation.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved CI blocker; implementation evidence pending.
