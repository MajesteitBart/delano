---
id: T-004
name: Remove default absolute path output from hooks
status: done
workstream: WS-B
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T22:44:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Remove default absolute path output from hooks

## Description
Update hook output and helper scripts so default terminal/log text avoids local machine paths.

## Acceptance Criteria
- [x] Current repo state has been inspected before implementation starts.
- [x] The delivered change is represented in Delano runtime assets, project contracts, validation, fixtures, or docs as appropriate.
- [x] The change is validated with the smallest meaningful command or fixture.
- [x] Evidence is recorded in this task or a task update before the task is marked done.

## Technical Notes
- This task came from the Delano next-step roadmap review.
- Keep behavior additive or dry-run-first when the task touches validation, remote sync, logs, or write-capable commands.
- Do not claim completion from documentation alone unless the task is explicitly documentation-only.

## Definition of Done
- [x] Implementation or contract creation complete
- [x] Validation or focused test passes
- [x] Review complete
- [x] Docs updated where behavior changes

## Evidence Log
- 2026-04-28T23:14:00Z: Task created from roadmap review; implementation evidence pending.
- 2026-04-29T22:44:00Z: Changed `bash-worktree-fix.sh` to print `<repo-root> (repo-name)` instead of the absolute repository path, synced `.claude`, rebuilt payload assets, and extended log-safety validation to catch regressions. Validation: hook output contained no absolute path; `.agents/scripts/check-log-safety.sh` passed; `.agents/scripts/pm/validate.sh` passed; `npm test` passed (11 tests).
