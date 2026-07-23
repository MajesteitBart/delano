---
id: T-002
name: Add chronological defaults and project creation metadata
status: done
workstream: WS-A
created: 2026-07-13T20:18:44Z
updated: 2026-07-13T20:33:38Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.delano/viewer/server.js, .delano/viewer/ui/src/lib/**, .delano/viewer/ui/src/pages/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-003, AC-004]
---

# Task: Add chronological defaults and project creation metadata

## Description

Add explicit DataTable initial sorting, apply newest-first Updated ordering to time-relevant tables while preserving Context pack order, and expose project Created metadata in Workspace Projects.

## Acceptance Criteria
- [x] Tables with Updated columns default to descending Updated order.
- [x] Context pack preserves canonical context-reader order.
- [x] Workspace Projects includes Created using project contract frontmatter.
- [x] Timestamp accessors retain raw values for chronological sorting.

## Traceability
- Story: US-003
- Acceptance criteria: AC-003 AC-004

## Technical Notes

- Add `initialSorting` to the generic DataTable rather than sorting input arrays per page.
- Project `created` is already emitted by the server.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T20:33:38Z: Domain checks, 7 focused component/source checks, and viewer typecheck passed; Context pack explicitly opts out of initial Updated sorting.

- 2026-07-13T20:23:32Z: Project created metadata and raw timestamp extension points are confirmed.

- 2026-07-13T20:23:32Z: T-001 is done and chronological defaults are dependency-safe.
- 2026-07-13T20:18:44Z: Created from .project/templates/task.md by `delano task add`.
