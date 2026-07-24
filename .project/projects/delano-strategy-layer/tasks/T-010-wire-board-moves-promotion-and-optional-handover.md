---
id: T-010
name: Wire board moves promotion and optional handover
status: planned
workstream: WS-C
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-008, T-009]
conflicts_with: [.delano/viewer/ui/src/pages/roadmap/**, .delano/viewer/ui/src/lib/domain/handover.ts]
parallel: false
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-003,US-006
acceptance_criteria_ids: [AC-004, AC-007, AC-012]
---

# Task: Wire board moves promotion and optional handover

## Description

Add explicit board controls for horizon moves and promotion, conflict/error feedback, and a separate optional start handover after the new project spec exists.

## Acceptance Criteria

- [ ] Each non-terminal card exposes keyboard-operable move controls that preview the source/destination and require explicit confirmation before submission.
- [ ] Promotion collects the required project slug/name/owner inputs, previews the source item and target project path, and requires explicit confirmation.
- [ ] Move and promotion submit the card’s current hash and surface 409 conflicts without optimistic canonical state.
- [ ] Successful actions refresh from the server response/index and report exactly which canonical files changed.
- [ ] After promotion succeeds, the UI offers the existing `start` handover against the returned spec as a separate optional action.
- [ ] Failed or cancelled promotion never offers or invokes handover.
- [ ] Terminal cards expose no promotion action, arbitrary frontmatter remains uneditable, and no drag-only interaction is introduced.
- [ ] Focused component/source tests cover confirmation, cancellation, conflict, domain error, successful move, successful promotion, and optional handover.

## Traceability
- Story: US-003,US-006
- Acceptance criteria: AC-004, AC-007, AC-012

## Technical Notes

Keep the handover type union unchanged (`annotations|start|review`). The UI sequence is create first, then optionally dispatch against the created spec with its returned baseline/hash when required.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Viewer interaction documentation impact recorded for T-013

## Evidence Log
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
