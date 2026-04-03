---
id: T-003
name: Runtime compatibility and validation
status: done
created: 2026-04-03T06:43:27Z
updated: 2026-04-03T06:43:27Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Runtime compatibility and validation

## Description

Update runtime scripts, hooks, log locations, installer messaging, and skill/runbook references so the executable model matches the handbook and validation passes on this Windows environment.

## Acceptance Criteria
- [x] `pm/init.sh` emits probe-aware scaffolds and validates through the canonical `.agents` runtime.
- [x] `pm/validate.sh` treats `.agents` as canonical, tolerates `.claude`, and passes in this environment.
- [x] `.claude` remains a working compatibility mirror of the updated `.agents` runtime.

## Technical Notes

- Updated runtime scripts, hooks, log writers, test/query helpers, and skill/runbook script hooks.
- Synced `.claude` from `.agents` after the canonical runtime changes landed.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: `bash .agents/scripts/pm/validate.sh` passed with 0 errors and 0 warnings.
- 2026-04-03: `bash .claude/scripts/pm/validate.sh` passed after syncing the compatibility mirror.
- 2026-04-03: `bash .agents/scripts/pm/init.sh delano-smoke-probe-check "Delano Smoke Probe Check" team team` generated the expected scaffold before cleanup.
