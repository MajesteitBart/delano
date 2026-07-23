---
id: T-001
name: Expose project research and project evidence routes
status: done
workstream: WS-A
created: 2026-07-13T17:57:30Z
updated: 2026-07-13T18:04:16Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [.delano/viewer/server.js, .delano/viewer/ui/src/lib/domain/types.ts, .delano/viewer/ui/src/pages/ProjectPages.tsx, .delano/viewer/ui/src/components/organisms/Sidebar.tsx, test/viewer-server.test.js]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001]
---

# Task: Expose project research and project evidence routes

## Description

Classify every nested project research Markdown file with a dedicated role, expose sorted research paths in the project outline, and add project-scoped Research and Progress routes using the existing document-table pattern.

## Acceptance Criteria

- [x] Nested `research/**` Markdown files, including `research/**/progress.md`, receive role `research` and appear in sorted project-outline research paths.
- [x] The selected-project sidebar shows one Research entry and one Progress entry with project-specific counts; each opens only that project's files.
- [x] Server fixtures and focused UI/domain checks cover classification, outline ordering, empty states, and route wiring.

## Traceability

- Story: US-001
- Acceptance criteria: AC-001

## Technical Notes

- Research classification must run before filename-based progress classification.
- Reuse the document table rather than listing every research file in the sidebar.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T18:04:16Z: Viewer build/type-check passed; linked-context server fixture passed; four focused component source checks passed; git diff check passed.

- 2026-07-13T18:00:24Z: Implementing research classification and project evidence routes.

- 2026-07-13T18:00:23Z: Dependency-free task passed readiness review; acceptance and fixture boundaries are explicit.
- 2026-07-13T17:57:30Z: Created from .project/templates/task.md by `delano task add`.
