---
id: T-003
name: Add searchable option and relationship filters
status: done
workstream: WS-A
created: 2026-07-13T20:18:45Z
updated: 2026-07-13T20:33:39Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: [.delano/viewer/ui/src/components/**, .delano/viewer/ui/src/lib/**, .delano/viewer/ui/src/pages/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-005, AC-006]
---

# Task: Add searchable option and relationship filters

## Description

Upgrade bounded DataTable filters to searchable multi-select command lists and wire relationship and canonical task enum columns to deterministic options.

## Acceptance Criteria
- [x] Project and Workstream task filters expose searchable multi-select choices derived from indexed rows.
- [x] Status, Priority, and Estimate expose searchable multi-select choices from schema options.
- [x] Selected filters remain visibly active and can be cleared per column or globally.
- [x] Keyboard users can open, search, select, and clear the filter controls.

## Traceability
- Story: US-004
- Acceptance criteria: AC-005 AC-006

## Technical Notes

- Compose existing Command and Popover components; do not create a second filter system.
- Option values must exactly match each accessor value, including `None`.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T20:33:39Z: Project and Workstream options derive from indexed rows; Status, Priority, and Estimate derive from schema options; domain, 7 component/source checks, and typecheck passed.

- 2026-07-13T20:33:38Z: Relationship values and canonical schema options are available in the current viewer index.

- 2026-07-13T20:33:38Z: T-002 is done and searchable option filters are dependency-safe.
- 2026-07-13T20:18:45Z: Created from .project/templates/task.md by `delano task add`.
