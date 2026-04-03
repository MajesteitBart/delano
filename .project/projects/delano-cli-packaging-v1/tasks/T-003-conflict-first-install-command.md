---
id: T-003
name: Conflict-first install command
status: review
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:18:28Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: false
priority: high
estimate: L
---

# Task: Conflict-first install command

## Description

Implement `delano install` so it computes the full write plan first, reports conflicts clearly, and writes only allowlisted paths unless the user explicitly chooses `--force`.

## Acceptance Criteria
- [x] `delano install` supports at least `--target`, `--agents`, `--force`, and `--yes`.
- [x] The command computes the full install plan before writing files.
- [x] Conflicts report the path, its type (`file`, `directory`, or `symlink`), and the reason it blocks install.
- [x] Without `--force`, conflicting writes abort the install.
- [x] With `--force`, only allowlisted payload paths are overwritten.

## Technical Notes

- Be especially conservative around `.project/**`, `.agents/**`, and `.agents/skills/**`.
- The install manifest written by the CLI should be small and useful for later repair or upgrade reasoning.
- Do not silently create or mutate top-level adapter entry docs in the normal base install path.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Implemented conflict-first `delano install` with allowlist-driven planning, sorted conflict reports, safe force behavior, and parent-path blocker detection. Smoke-tested first install, conflict failure, force reinstall, and non-forceable parent blockers.
