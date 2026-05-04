---
id: T-003
name: Add GitHub status and PR inspection
status: done
workstream: WS-B
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:18:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add GitHub status and PR inspection

## Description
Fetch or mock GitHub issue/PR state and compare it to local task metadata.

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

- 2026-04-29T23:18:00Z: Inspected current local sync map and Git origin. Added local dry-run GitHub inspection via `scripts/inspect-github-sync.mjs` to normalize issue and PR refs, infer the GitHub repo from project metadata or origin, and emit mapping-drift repair recommendations without remote writes; mirrored it to `.agents` and `.claude`, wired `check:github-sync` into PM validation and package tests, and staged it in the npm payload. Validation passed: `npm run check:github-sync`, `bash .agents/scripts/pm/validate.sh`, and `npm test`.
