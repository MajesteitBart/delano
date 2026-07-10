---
id: T-004
name: Create Delano Home view
status: planned
workstream: WS-C
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002 T-003]
conflicts_with: [.delano/viewer/ui/src/pages/HomePage.tsx]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001]
---

# Task: Create Delano Home view

## Description

Build the calm default Home composition for Current, Recently completed, and Up next using shared selectors and real activity data, without duplicating full portfolio tables.

## Acceptance Criteria

- [ ] Home communicates current, recent, and upcoming work without a selected project and opens as the default route after integration
- [ ] Sections use live derived data, conservative relationship labels, useful empty/error states, and direct links to relevant tasks/files/projects
- [ ] Desktop and compact compositions match the approved Home design and use shared table/query primitives where tabular

## Traceability
- Story: US-001
- Acceptance criteria: AC-001

## Technical Notes

- Compose one dominant Current/Now region, a compact Recent delivery queue, and a concise Up next list. Do not open with KPI cards or decorative charts.
- Use actual working-tree/commit provenance labels and conservative wording such as “near this delivery” when task/file linkage is not explicit.
- Keep row counts intentionally small with “View all” navigation into Review, Plan, and Updated Files.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
