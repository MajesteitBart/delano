---
id: T-002
name: Extend path scanners for WSL path leaks
status: done
workstream: WS-A
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [T-001]
parallel: false
priority: high
estimate: M
---

# Task: Extend path scanners for WSL path leaks

## Description

Update path-leak detection and repair tooling so WSL drive-mount absolute paths are caught alongside Windows and Unix absolute paths.

## Acceptance Criteria

- [x] PM validation catches a generic WSL drive-mount absolute path fixture.
- [x] Standalone path-standard checks catch the same fixture.
- [x] Path repair tooling redacts the WSL path form when repair is requested.
- [x] `.agents` and compatibility runtime copies stay aligned where applicable.
- [x] Evidence includes the focused validation command that proves the new pattern is enforced.

## Technical Notes

- Use placeholder or synthetic fixture content, not a real local path.
- Check `.agents/scripts/pm/validate.sh`, `.agents/scripts/check-path-standards.sh`, `.agents/scripts/fix-path-standards.sh`, strict fixtures, and mirrored `.claude` assets.
- Avoid matching normal HTTPS URLs.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved path-scanner blocker; implementation evidence pending.
- 2026-05-04T09:35:25Z: Extended PM validation, path-standard checks, repair tooling, and strict fixture detection for WSL drive-mount path forms in `.agents`, `.claude`, and root scripts. Validation passed: `node scripts/check-strict-fixtures.mjs`; `bash .agents/scripts/check-path-standards.sh`; `bash .agents/scripts/pm/validate.sh`.
