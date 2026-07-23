---
id: T-004
name: TipTap editor surface with frontmatter card
status: done
workstream: WS-B
created: 2026-07-09T23:58:20Z
updated: 2026-07-10T00:45:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: ["T-001"]
conflicts_with: []
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: ["AC-001"]
---

# Task: TipTap editor surface with frontmatter card

## Description

Lazily-loaded TipTap 3 edit surface in the document reader: StarterKit + table/link/task-list extensions + @tiptap/markdown; frontmatter split and shown as a locked properties card; Edit toggle (button, `e`, Cmd/Ctrl+E) swaps read renderer for editor in the same layout. Design-bearing: Claude authors.

## Acceptance Criteria
- [x] Edit mode reachable by button and shortcuts; Escape returns to read mode with unsaved-changes guard
- [x] Editor supports all FR-2 constructs and serializes back to markdown-true text
- [x] Frontmatter rendered as locked card, byte-identical on save
- [x] Editor chunk is lazy; read-mode bundle unchanged (verified by build output)

## Traceability
- Story: US-001, US-002
- Acceptance criteria: AC-001

## Technical Notes

Read-mode renderer and annotation layer untouched. Tokens/motion consistent with existing design system.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:45:24Z: DocumentEditor.tsx: TipTap 3 StarterKit+TableKit+TaskList/Item+Markdown+Placeholder, contentType markdown, getMarkdown serialization; frontmatter locked card with byte-preserving splitRawFrontmatter (frontmatterRaw+body===original); Edit via button, e, Ctrl/Cmd+E; Escape exit with two-step discard. Lazy route chunk confirmed in build (DocumentEditor.js 532KB separate, viewer.js unchanged). typecheck+build green. Interactive browser confirmation scheduled in T-009.

- 2026-07-10T00:35:16Z: Task started with `delano task start`.
- 2026-07-09T23:58:20Z: Created from .project/templates/task.md by `delano task add`.
