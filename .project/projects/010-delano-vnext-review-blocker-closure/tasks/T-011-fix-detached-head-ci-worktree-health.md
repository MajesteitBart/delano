---
id: T-011
name: Fix detached-head CI worktree health
status: done
workstream: WS-D
created: 2026-05-04T10:02:29Z
updated: 2026-05-04T10:02:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: S
---

# Task: Fix detached-head CI worktree health

## Description

Make the worktree-health check tolerate detached `HEAD` checkouts in GitHub Actions while still reporting the condition.

## Acceptance Criteria
- [x] Detached `HEAD` is reported as a warning instead of a fatal issue.
- [x] Local branch checkouts still report branch and worktree health.
- [x] The fix is mirrored across root, `.agents`, and `.claude` runtime copies.
- [x] Evidence records local and remote validation.

## Technical Notes
- GitHub Actions pull-request checkouts commonly run detached.
- The script should still fail on actual git command failures.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:49:35Z: Updated worktree-health scripts so detached `HEAD` becomes a warning. Validation passed: `npm test`; `bash .agents/scripts/pm/validate.sh`; detached worktree simulation.
- 2026-05-04T09:50:42Z: GitHub Actions PR Validate run `25312402520` passed for head `44a7dad99aa80c76b6ff7eb810e78b70091fdf27`.
