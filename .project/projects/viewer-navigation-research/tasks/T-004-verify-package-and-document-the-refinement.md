---
id: T-004
name: Verify package and document the refinement
status: done
workstream: WS-A
created: 2026-07-13T17:57:32Z
updated: 2026-07-13T18:27:26Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002, T-003]
conflicts_with: [.delano/viewer/public/**, assets/payload/**, docs/**, test/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007]
---

# Task: Verify package and document the refinement

## Description

Run the cross-boundary quality pass, update viewer documentation, rebuild generated/package assets, and capture primary/linked browser evidence for research, route preservation, ordering, counts, and mobile behavior.

## Acceptance Criteria

- [x] Viewer build/type-check, focused fixtures, full `npm test`, payload build, package drift, contract validation, and release validation pass.
- [x] Browser smoke verifies research visibility, project and linked-worktree route preservation, exact Workspace order/counts, responsive navigation, and zero console/page errors.
- [x] Viewer documentation explains Research/Progress project scope, semantic switch fallback, Workspace entries, and open-count semantics.
- [x] Evidence is recorded in the task/update log; no publication or tracker mutation occurs.

## Traceability

- Story: US-001 US-002 US-003
- Acceptance criteria: AC-001 AC-002 AC-003 AC-004 AC-005 AC-006 AC-007

## Technical Notes

- Build viewer source before rebuilding the npm payload.
- Exercise a divergent linked worktree where some research paths differ from primary.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T18:27:26Z: Viewer build and focused fixtures passed; npm test passed 117/117; linked-worktree and narrow-layout browser smoke passed with no captured runtime errors; payload and manifest checks passed for 216 entries; release validation passed with 0 errors and 0 warnings; see update 2026-07-13-t-004-quality-and-outcome-review-passed.md.

- 2026-07-13T18:13:03Z: Running documentation, package, release, and browser quality gates.

- 2026-07-13T18:13:03Z: All implementation dependencies are done and cross-boundary verification is ready.
- 2026-07-13T17:57:32Z: Created from .project/templates/task.md by `delano task add`.
