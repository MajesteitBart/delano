---
id: T-003
name: Guarded save endpoint
status: done
workstream: WS-B
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T00:34:12Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-001"]
conflicts_with: []
parallel: false
priority: high
estimate: S
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: ["AC-002"]
---

# Task: Guarded save endpoint

## Description

Add `POST /api/save` to `.delano/viewer/server.js`: accepts {path, baseHash, markdown}; validates repo-relative `.project` markdown path with existing guards; 409 on hash mismatch with current hash in body; atomic write; returns new hash. Reuses the apply path's hash + path-scope code.

## Acceptance Criteria
- [x] Path outside `.project` or non-markdown rejected with 4xx
- [x] Stale baseHash returns 409 and does not write
- [x] Successful save writes exactly the posted bytes and returns the new hash
- [x] Server tests cover the three cases above and pass in `npm test`

## Traceability
- Story: US-003
- Acceptance criteria: AC-002

## Technical Notes

server.js is owned by Codex tasks; T-003 lands before T-006 touches the same file (sequenced per worktree rule).

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:34:12Z: No new endpoint needed: existing POST /api/apply implements path scoping, expectedHash 409 with currentBaseline, confirm gate, audit trail; covered by test/viewer-server.test.js (stale 409, malformed payload, successful write). Recorded as D-001; client integration lands with T-005.

- 2026-07-10T00:34:12Z: Task started with `delano task start`.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
