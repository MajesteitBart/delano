---
id: T-003
name: Add annotation drawer and export surface
status: ready
workstream: WS-B
created: 2026-06-30T14:12:03Z
updated: 2026-06-30T14:24:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-002]
conflicts_with: []
parallel: false
priority: high
estimate: L
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Add annotation drawer and export surface

## Description

Replace ad hoc metadata side panels with an annotation drawer that lists file-scoped feedback and can produce agent-ready markdown attachments.

## Acceptance Criteria

- [ ] Drawer is visible from document views, shows counts, supports select/delete/edit, and keeps content readable on tablet and desktop widths.
- [ ] Export generates deterministic markdown plus JSON payloads that include repo-relative paths and context-reader profile hints.
- [ ] Drawer uses shadcn/Radix primitives or compatible local equivalents for Marker, Attachment, Bubble, and Message styling.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Plannotator's `packages/ui/components/AnnotationSidebar.tsx`, `packages/ui/components/ExportModal.tsx`, and `packages/review-editor/utils/exportFeedback.ts` are the primary references for drawer count, deterministic ordering, copy/download export, and agent-readable markdown output.
- Delano export should include both markdown feedback and JSON attachments so chat can preserve exact anchors while humans can read the review.
- The drawer should be collapsible and should not replace the workspace sidebar.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-30T14:12:03Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from Plannotator sidebar/export behavior and Shadcn chat component docs.
