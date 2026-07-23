---
name: WS-A Workspace Navigation and Viewer UX
owner: bart
status: done
created: 2026-05-08T09:44:35Z
updated: 2026-05-11T15:25:00Z
---

# Workstream: WS-A Workspace Navigation and Viewer UX

## Objective

Shape the Delano viewer shell so sidebar navigation, selected-project context, and project source-contract views have clear and separate scopes.

## Owned Files/Areas

- `.delano/viewer/public/app.jsx`
- `.delano/viewer/public/styles.css`
- `.project/projects/011-delano-viewer-redesign/`

## Dependencies

- Existing viewer index and document APIs.
- Existing `.project` document role and status metadata.

## Risks

- Aggregated workspace views can only be as accurate as project metadata.
- The selected-project source-contract list may need a later IA pass.

## Handoff Criteria

- Global workspace navigation is available in the sidebar.
- Project-specific details remain in the selected project's main pane.
- Validation evidence is recorded in the task ledger.

## Completion Evidence

- 2026-05-11T15:25:00Z: WS-A tasks T-003 through T-008 marked done with browser evidence recorded in each task. Browser smoke at `http://127.0.0.1:3978/` covered Projects default route, persisted workspace pagination, shared pagination across workspace views, Overview workstream/open-task priority, workstream task de-duplication, and task-detail parent/sibling navigation. Console errors: 0.
