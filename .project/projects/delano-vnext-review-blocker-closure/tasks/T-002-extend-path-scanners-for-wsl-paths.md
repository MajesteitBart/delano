---
id: T-002
name: Extend path scanners for WSL path leaks
status: ready
workstream: WS-A
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
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

- [ ] PM validation catches a generic WSL drive-mount absolute path fixture.
- [ ] Standalone path-standard checks catch the same fixture.
- [ ] Path repair tooling redacts the WSL path form when repair is requested.
- [ ] `.agents` and compatibility runtime copies stay aligned where applicable.
- [ ] Evidence includes the focused validation command that proves the new pattern is enforced.

## Technical Notes

- Use placeholder or synthetic fixture content, not a real local path.
- Check `.agents/scripts/pm/validate.sh`, `.agents/scripts/check-path-standards.sh`, `.agents/scripts/fix-path-standards.sh`, strict fixtures, and mirrored `.claude` assets.
- Avoid matching normal HTTPS URLs.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved path-scanner blocker; implementation evidence pending.
