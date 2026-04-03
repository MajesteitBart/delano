---
id: T-003
name: Conflict-first install command
status: backlog
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:00:36Z
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
- [ ] `delano install` supports at least `--target`, `--agents`, `--force`, and `--yes`.
- [ ] The command computes the full install plan before writing files.
- [ ] Conflicts report the path, its type (`file`, `directory`, or `symlink`), and the reason it blocks install.
- [ ] Without `--force`, conflicting writes abort the install.
- [ ] With `--force`, only allowlisted payload paths are overwritten.

## Technical Notes

- Be especially conservative around `.project/**`, `.agents/**`, and `.agents/skills/**`.
- The install manifest written by the CLI should be small and useful for later repair or upgrade reasoning.
- Do not silently create or mutate top-level adapter entry docs in the normal base install path.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
