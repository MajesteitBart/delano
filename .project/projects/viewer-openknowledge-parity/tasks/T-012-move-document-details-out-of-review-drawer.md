---
id: T-012
name: Move document details out of review drawer
status: done
workstream: WS-D
created: 2026-07-10T17:28:56Z
updated: 2026-07-10T18:28:14Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-008]
conflicts_with: [viewer-reader, viewer-review-drawer]
parallel: true
priority: medium
estimate: S
operating_mode: feature
story_id:
acceptance_criteria_ids: []
---

# Task: Move document details out of review drawer

## Description

Move the document metadata currently shown in the review drawer's Details tab into the main document reader. Keep the drawer focused on annotations and review actions, while making path, status, updated time, title, and baseline provenance available without opening it.

## Acceptance Criteria

- [x] The main document reader shows path, status, updated time, title, and baseline hash/copy affordance for every supported document role without requiring the review drawer.
- [x] The review drawer no longer has a Details tab and opens directly to its annotations content.
- [x] Annotation refresh, selection, editing, deletion, export, and agent handover actions continue to work unchanged after the tab structure is removed.
- [x] The relocated metadata composes with task and workstream context without duplicating their status, priority, estimate, dependency, or acceptance summaries.
- [x] The metadata remains readable without horizontal overflow at desktop and compact widths, with accessible labels and keyboard-reachable copy controls.
- [x] Focused UI coverage, typecheck, production build, and a reader/review browser smoke pass.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes

Reuse `DocumentMetaFields` or `DocumentMetaPanel` from `components/organisms/DocumentMetaPanel.tsx` in the main reader rather than duplicating metadata formatting. Simplify `AnnotationDrawer` to a single annotations/review surface and remove the now-unnecessary `Tabs` composition. Keep metadata visually secondary to the document and avoid repeating task-specific fields already owned by `TaskContextPanel`.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T18:28:14Z: Reader metadata covers task and workstream roles; task status is not duplicated; review tabs are removed while annotation and handover wiring remains. Passed test:reader (2/2), UI typecheck, focused ESLint, production build, git diff --check, and desktop/compact browser smoke on the repo-local viewer with no horizontal overflow and an accessible baseline copy control. Contracts validated; unrelated repo-wide Claude mirror drift and three WSL /bin/bash test failures remain documented.

- 2026-07-10T18:06:43Z: Implementing metadata relocation and simplifying the review drawer

- 2026-07-10T18:06:43Z: Dependency T-008 is done; reader and review drawer scope is ready for implementation

- 2026-07-10T17:29:35Z: Task definition validated: status transitions, artifact schemas, operating modes, evidence map, dependency sequencing, and git diff whitespace checks passed.
- 2026-07-10T17:28:56Z: Created from .project/templates/task.md by `delano task add`.
