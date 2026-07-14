---
id: T-002
name: Keep the Review drawer overlay-only
status: done
workstream: WS-A
created: 2026-07-13T21:59:58Z
updated: 2026-07-13T22:08:31Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: S
operating_mode: feature
story_id: US-003
acceptance_criteria_ids: [AC-005, AC-008]
---

# Task: Keep the Review drawer overlay-only

## Description

Remove the reader layout compensation tied to Review state and tune the fixed drawer so it overlays without changing article geometry while remaining dismissible and readable at supported widths.

## Acceptance Criteria
- [x] At desktop width, opening and closing Review changes the reader article width by no more than one CSS pixel.
- [x] The fixed drawer overlays header and body without page-level horizontal overflow.
- [x] Narrow viewport behavior keeps the close control, review content, and document available.
- [x] A live browser measurement is recorded before closure.

## Traceability
- Story: US-003
- Acceptance criteria: AC-005, AC-008

## Technical Notes

The drawer is already fixed. The known cause is the `min-[1280px]:pr-[416px]` wrapper compensation in `DocumentReaderPage`; avoid unrelated shell-layout changes.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs impact completed in T-005

## Evidence Log

- 2026-07-13T22:08:31Z: T3 at 1679px viewport measured reader article 759.999px and layout 1119.990px both before and after Review; drawer toggled false→true while widths remained unchanged; focused source regression asserts no 416px padding rule and fixed drawer positioning.

- 2026-07-13T22:08:31Z: Verifying overlay-only drawer geometry after removal of layout compensation.

- 2026-07-13T22:08:31Z: Dependency T-001 complete; overlay implementation is isolated and browser measurement criteria are defined.
- 2026-07-13T21:59:58Z: Created from .project/templates/task.md by `delano task add`.
