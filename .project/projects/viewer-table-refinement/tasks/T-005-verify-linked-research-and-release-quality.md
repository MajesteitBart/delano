---
id: T-005
name: Verify linked research and release quality
status: done
workstream: WS-A
created: 2026-07-13T20:18:45Z
updated: 2026-07-13T21:13:56Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002, T-003, T-004]
conflicts_with: [.delano/viewer/public/**, assets/payload/**, docs/**, test/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-005
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008]
---

# Task: Verify linked research and release quality

## Description

Run focused and release gates, rebuild package artifacts, restart the shared viewer with current source, verify all table interactions and linked research in T3 Preview, document behavior, and close the delivery contract.

## Acceptance Criteria
- [x] Focused fixtures, viewer build/typecheck, full tests, package drift, Delano validation, and release validation pass.
- [x] T3 browser smoke verifies table spacing/boundaries, project click, Updated defaults, Created, relationship/enum/date filters, Context order, and responsive overflow.
- [x] The linked parity worktree renders six research documents with nested progress classified as research.
- [x] Browser diagnostics contain no application console/page errors; any expected SSE disconnect from a controlled restart is documented.
- [x] Evidence and viewer documentation are current; no commit, push, package publication, or remote tracker mutation occurs.

## Traceability
- Story: US-001 US-002 US-003 US-004 US-005
- Acceptance criteria: AC-001 AC-002 AC-003 AC-004 AC-005 AC-006 AC-007 AC-008

## Technical Notes

- Restart only the process currently listening on port 3978 and verify its command line before stopping it.
- Use a fresh browser load after restart so client and server versions agree.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T21:13:56Z: Focused assertions 8/8, npm test 117/117, viewer/package builds, manifest drift, T3 smoke, Research 6, annotation history regression, and Delano release validation all passed; see closeout.md and .agents/logs/tests/t005-viewer-table-refinement-browser-smoke.md.

- 2026-07-13T20:45:06Z: Cross-boundary browser, package, documentation, and release gates are ready.

- 2026-07-13T20:45:06Z: All implementation dependencies are done and release verification is dependency-safe.
- 2026-07-13T20:18:45Z: Created from .project/templates/task.md by `delano task add`.
