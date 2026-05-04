---
id: T-003
name: Close pack-output version drift
status: ready
workstream: WS-B
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [T-004]
parallel: false
priority: high
estimate: S
---

# Task: Close pack-output version drift

## Description

Resolve the stale `pack-output.json` metadata that still reports an older package version while `package.json` reports the current version.

## Acceptance Criteria

- [ ] The project has an explicit decision for whether `pack-output.json` is tracked, regenerated, or removed.
- [ ] Tracked package output no longer reports a stale package version.
- [ ] A validation or test prevents future tracked pack metadata from disagreeing with `package.json`.
- [ ] Evidence is recorded before the task is marked done.

## Technical Notes

- Current probe found `package.json` at `0.1.7` and `pack-output.json` at `0.1.4`.
- If the artifact is removed, update tests or docs that expect it.
- If regenerated, make the generation command reproducible.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from unresolved stale package metadata blocker; implementation evidence pending.
