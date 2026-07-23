---
name: WS-B Process Navigation UX
owner: bart
status: done
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T21:57:54Z
---

# Workstream: WS-B Process Navigation UX

## Objective

Make the viewer explain Delano process and progress clearly through project/folder navigation, context-aware filters, outlines, workstreams, tasks, and rendered documents.

## Owned Files/Areas

- `.delano/viewer/public/app.js`
- `.delano/viewer/public/index.html`
- project outline and filter behavior
- workstream/task navigation behavior

## Dependencies

- WS-A index data and role classification.
- Representative `.project` content with specs, plans, workstreams, tasks, and updates.

## Risks

- The UI can regress into a document browser if project outlines and workstream task grouping are unclear.
- Stale filters when switching folders can hide documents and make the viewer feel broken.
- Task grouping by inference may be imperfect for sparse or inconsistent project contracts.

## Handoff Criteria

- Switching projects/folders resets filters appropriately.
- Status filters only appear when relevant to the selected folder/project.
- Project outlines expose spec, plan, progress, decisions, workstreams, and tasks.
- Selecting a workstream focuses the list and reveals subtasks.
