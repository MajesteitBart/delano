---
id: T-001
name: Remove leaked vNext source-review path
status: ready
workstream: WS-A
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [T-002]
parallel: false
priority: high
estimate: S
---

# Task: Remove leaked vNext source-review path

## Description

Replace the user-specific absolute source-review path in the vNext runtime upgrade spec with a repo-safe reference or sanitized provenance note.

## Acceptance Criteria

- [ ] The vNext spec no longer stores a user-specific absolute source-review path.
- [ ] The replacement reference is useful to maintainers without exposing local machine structure.
- [ ] A path-safety check confirms the edited contract does not contain the leaked path.
- [ ] Evidence is recorded before the task is marked done.

## Technical Notes

- Inspect `.project/projects/delano-vnext-runtime-upgrade/spec.md`.
- Prefer a relative repo artifact, sanitized label, or decision-log reference.
- Do not add the leaked value to new docs, fixtures, or evidence.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved vNext review blocker; implementation evidence pending.
