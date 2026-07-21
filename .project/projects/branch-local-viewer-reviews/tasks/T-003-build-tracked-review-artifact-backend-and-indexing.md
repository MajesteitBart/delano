---
id: T-003
name: Build tracked review artifact backend and indexing
status: done
workstream: WS-B
created: 2026-07-14T16:49:27Z
updated: 2026-07-16T20:42:59Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002]
conflicts_with: [.delano/viewer/server.js]
parallel: false
priority: high
estimate: XL
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-004, AC-005, AC-006, AC-007, AC-008]
---

# Task: Build tracked review artifact backend and indexing

## Description

Add contained, concurrency-safe review publication and lifecycle endpoints backed by per-session Markdown files under .project/reviews, then index and validate them as first-class review artifacts.

## Acceptance Criteria

- [x] Explicit publication writes exactly one schema-valid review artifact and performs no commit, push, remote message, or unrelated canonical write.
- [x] Review artifacts use normalized source hashes and portable provenance and never contain machine-local paths or launch receipts.
- [x] Review role, status options, index metadata, and open-count behavior derive from review.schema.json.
- [x] Concurrent review publications cannot overwrite another session and oversized or malformed requests fail safely.
- [x] Backend tests cover committed, explicitly published uncommitted, stale, resolved, and archived review artifacts.

## Traceability
- Story: US-002
- Acceptance criteria: AC-004, AC-005, AC-006, AC-007, AC-008

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-16T20:42:59Z: node --test test/viewer-server.test.js: 14/14 passed; node --test test/review-contract.test.js: 4/4 passed.

- 2026-07-16T20:37:14Z: Implement tracked review publication, lifecycle backend, schema-derived indexing, and focused tests.

- 2026-07-16T20:37:14Z: Readiness review passed: T-001 and T-002 are done; review schema and selected-context runtime are available.
- 2026-07-14T16:49:27Z: Created from .project/templates/task.md by `delano task add`.
