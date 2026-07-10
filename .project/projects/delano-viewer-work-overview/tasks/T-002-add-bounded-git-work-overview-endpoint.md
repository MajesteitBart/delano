---
id: T-002
name: Add bounded Git work overview endpoint
status: planned
workstream: WS-B
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [.delano/viewer/server.js, test/viewer-server.test.js]
parallel: true
priority: high
estimate: L
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-003, AC-007]
---

# Task: Add bounded Git work overview endpoint

## Description

Expose repo-relative working-tree and recent committed file activity plus task evidence summaries through a bounded, read-only viewer server contract with graceful Git-unavailable behavior.

## Acceptance Criteria

- [ ] Endpoint returns working-tree and recent commit/file records with explicit provenance, repo-relative paths, caps, and generated timestamp
- [ ] Git commands use argument arrays without a shell and cannot mutate repository state or leak absolute paths
- [ ] Server tests cover change kinds, rename paths, untracked/staged/unstaged records, Git failure, caps, and current endpoint regression

## Traceability
- Story: US-004
- Acceptance criteria: AC-003 AC-007

## Technical Notes

- Use `spawnSync` with explicit Git arguments, `cwd: repoRoot`, no shell, timeout/maxBuffer caps, and sanitized error mapping.
- Prefer NUL-delimited porcelain/log formats. Preserve both paths for rename/copy and keep staged/unstaged facts explicit before deriving a display kind.
- Return repo-relative paths only. Join exact `.project/<doc.path>` matches to index metadata without exposing absolute paths.
- Add review-summary parsing only for bounded indexed task documents and return checked/total acceptance plus evidence presence; do not invent a persisted review state.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
