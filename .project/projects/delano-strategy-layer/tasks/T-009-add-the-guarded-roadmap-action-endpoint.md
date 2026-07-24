---
id: T-009
name: Add the guarded roadmap action endpoint
status: planned
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005, T-006, T-007]
conflicts_with: [.delano/viewer/server.js, test/viewer-server.test.js]
parallel: false
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-006
acceptance_criteria_ids: [AC-007, AC-011]
---

# Task: Add the guarded roadmap action endpoint

## Description

Add a structured viewer endpoint for roadmap mutations that reuses the CLI domain service and the viewer’s repository/worktree, hash, confirmation, and audit safety boundaries.

## Acceptance Criteria

- [ ] The endpoint accepts only documented roadmap actions and whitelisted action-specific fields; arbitrary frontmatter keys and replacement Markdown are rejected.
- [ ] Apply capability denial, repository/worktree mismatch, unsafe/unknown paths, context switching, wrong method, and malformed/oversized bodies fail before mutation.
- [ ] A current `expectedHash` and `confirm: true` are required for every action; stale hashes return 409 with no write.
- [ ] Lifecycle/move/promotion validation comes from the shared roadmap service rather than server-local duplicate rules.
- [ ] A successful mutation records an audit receipt with action, repository-relative sources/outputs, prior hash, resulting hash where applicable, and timestamp without local absolute paths.
- [ ] Promotion returns the created project/spec path, leaves the roadmap item hash unchanged, and never invokes handover.
- [ ] Server tests cover every guard, valid move, valid promotion, domain rejection, audit output, and injected partial-creation failure.

## Traceability
- Story: US-006
- Acceptance criteria: AC-007, AC-011

## Technical Notes

Prefer one `/api/roadmap/action` boundary over action-specific endpoints so capability/audit logic stays centralized. Preserve the editor’s locked-frontmatter behavior.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] API contract documented in tests

## Evidence Log
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
