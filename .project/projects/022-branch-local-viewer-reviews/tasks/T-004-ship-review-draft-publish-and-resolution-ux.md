---
id: T-004
name: Ship review draft, publish, and resolution UX
status: done
workstream: WS-B
created: 2026-07-14T16:49:28Z
updated: 2026-07-16T20:50:24Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: [.delano/viewer/ui]
parallel: false
priority: high
estimate: XL
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-004, AC-005, AC-006, AC-007]
---

# Task: Ship review draft, publish, and resolution UX

## Description

Replace annotation-only Review behavior with private local drafts, explicit tracked publication, review navigation, stale/re-anchored feedback, privacy copy, and status-driven resolution/archive UX.

## Acceptance Criteria

- [x] Creating or editing a draft does not write tracked files until the user explicitly publishes.
- [x] Publish clearly explains Git-history privacy and uncommitted-source provenance and never implies that Viewer committed or pushed.
- [x] Published reviews render human-readable findings, discussion, source provenance, stale state, and deterministic quote re-anchoring.
- [x] Resolve and archive operations update schema-valid status without moving the review file, and counts include only open findings.
- [x] UI/domain tests cover primary and linked contexts, draft persistence, publication errors, stale content, lifecycle filtering, and accessibility.

## Traceability
- Story: US-002
- Acceptance criteria: AC-004, AC-005, AC-006, AC-007

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-16T20:50:24Z: Changed UI files eslint passed; UI test:domain passed; UI build passed; focused review server integration passed. Full UI lint skipped as a gate due seven pre-existing violations in untouched shadcn/hook files.

- 2026-07-16T20:42:59Z: Implement private draft, explicit publish, review navigation, freshness, and lifecycle UX.

- 2026-07-16T20:42:59Z: Readiness review passed: T-003 is done and review publication/lifecycle APIs are available.
- 2026-07-14T16:49:28Z: Created from .project/templates/task.md by `delano task add`.
