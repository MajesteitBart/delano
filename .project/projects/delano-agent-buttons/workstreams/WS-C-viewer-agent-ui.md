---
id: WS-C
name: WS-C Viewer Agent UI
owner: frontend
status: planned
created: 2026-06-17T12:38:14Z
updated: 2026-06-17T14:02:00Z
---

# Workstream: WS-C Viewer Agent UI

## Objective
Expose agent launch controls in the viewer where they match the user's current review task without making the read-only UI feel like a mutation control panel.

## Owned Files/Areas
- `.delano/viewer/public/app.jsx`
- `.delano/viewer/public/styles.css`
- Project overview, task detail, and blocked-task contexts

## Dependencies
- WS-A URL builders.
- WS-B prompt presets.
- Existing viewer navigation/state model.

## Risks
- Row actions crowd tables or wrap badly on mobile.
- Action labels imply automatic execution.
- Provider buttons appear on views where lifecycle actions are unsafe.
- A global topbar action generates vague prompts with insufficient context.

## Handoff Criteria
- Agent menu renders only on v1-approved contexts.
- UI exposes provider choice and copy fallback.
- Labels use "Open in..." or "Copy prompt"; lifecycle verbs are not top-level button labels.
- Top-level action label is "Agent" or context-specific "Carry forward with agent" / "Investigate blocker with agent".
- Existing open-in-IDE and open-folder behavior still works.
