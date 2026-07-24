---
id: T-009
name: Add the guarded roadmap action endpoint
status: done
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T12:43:22Z
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

- [x] The endpoint accepts only documented roadmap actions and whitelisted action-specific fields; arbitrary frontmatter keys and replacement Markdown are rejected.
- [x] Apply capability denial, repository/worktree mismatch, unsafe/unknown paths, context switching, wrong method, and malformed/oversized bodies fail before mutation.
- [x] A current `expectedHash` and `confirm: true` are required for every action; stale hashes return 409 with no write.
- [x] Lifecycle/move/promotion validation comes from the shared roadmap service rather than server-local duplicate rules.
- [x] A successful mutation records an audit receipt with action, repository-relative sources/outputs, prior hash, resulting hash where applicable, and timestamp without local absolute paths.
- [x] Promotion returns the created project/spec path, leaves the roadmap item hash unchanged, and never invokes handover.
- [x] Server tests cover every guard, valid move, valid promotion, domain rejection, audit output, and injected partial-creation failure.

## Traceability
- Story: US-006
- Acceptance criteria: AC-007, AC-011

## Technical Notes

Prefer one `/api/roadmap/action` boundary over action-specific endpoints so capability/audit logic stays centralized. Preserve the editor’s locked-frontmatter behavior.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] API contract documented in tests

## Evidence Log

- 2026-07-24T12:29:45Z: Added POST /api/roadmap/action: single guarded boundary accepting only move/start/close/defer/promote with per-action field whitelists (frontmatter/replacementMarkdown rejected), applyContract capability checks before and after body read, repository-relative containment check, required expectedHash (409 on stale with currentHash and zero writes), confirm:true gate, delegation to the shared roadmap-state domain service (CliError mapped to 422), and roadmap-action audit receipts in the annotation store with repo-relative sources/outputs, prior/next hash, and timestamp. Promotion returns 201 with created spec path and unchanged item hash, never invoking handover; injected partial-creation failure (spec template without updated) leaves no project dir, no staging residue, and no audit entry; HEAD-change guard returns 409 without writes. Evidence: viewer-server suite 23/23 pass including 3 new endpoint tests covering every guard, valid move, valid promotion, domain rejections, audit output, and partial-creation failure.

- 2026-07-24T12:25:39Z: Dependency-safe: T-005 T-006 T-007 are done; server conflict zone is free
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
