---
id: T-002
name: Implement selected-context capabilities and safe dispatch
status: done
workstream: WS-B
created: 2026-07-14T16:49:27Z
updated: 2026-07-16T20:37:14Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.delano/viewer/server.js]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002, AC-003]
---

# Task: Implement selected-context capabilities and safe dispatch

## Description

Replace the primary-derived writable gate with endpoint-specific capabilities and fresh selected-context revalidation, delivering safe task/workstream start and review dispatch from any registered worktree.

## Acceptance Criteria

- [x] Context/index payloads expose dispatch, review, publishReview, and applyContract capabilities plus separate worktree risk/provenance.
- [x] Start and annotation-free review handovers succeed from primary and linked worktrees and launch with the selected worktree as cwd.
- [x] Deleted worktrees, branch or relevant source drift, stale generation, and context-switch races fail before launch with actionable status.
- [x] The UI uses explicit capabilities and never silently falls back to the primary checkout.
- [x] Server tests replace the linked-worktree handover 403 expectation with capability and stale-context coverage.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001, AC-002, AC-003

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-16T20:37:14Z: node --test test/viewer-server.test.js: 13/13 passed; npm --prefix .delano/viewer/ui run test:domain passed; npm --prefix .delano/viewer/ui run build passed.

- 2026-07-16T20:29:07Z: Implement selected-context capabilities and fresh safe dispatch within WS-B owned runtime surfaces.

- 2026-07-16T20:29:06Z: Readiness review passed: T-001 is done and the WS-A review/context contract is available.
- 2026-07-14T16:49:27Z: Created from .project/templates/task.md by `delano task add`.
