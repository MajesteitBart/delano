---
name: Delano Viewer Redesign
status: done
lead: bart
created: 2026-05-04T20:00:00Z
updated: 2026-05-08T09:44:35Z
linear_project_id:
risk_level: low
spec_status_at_plan_time: complete
---

# Delivery Plan: Delano Viewer Redesign

## What Changed After Probe

No prototype probe was required for the initial redesign. A later live-design pass found that the sidebar repeated the selected project's dashboard sections, so the sidebar was reframed as workspace-level navigation.

## Architecture Decisions

- Keep the viewer as a local read-only interface under `.delano/viewer`.
- Keep selected-project content in the main pane.
- Use the sidebar for workspace-level navigation and selected-project source-contract entry points.
- Derive aggregate workspace counts from the existing project index and document metadata.

## Probe-Driven Architecture Changes

- None. `probe_required` was false and `probe_status` is skipped.

## Workstream Design

- `WS-A Workspace Navigation and Viewer UX`: owns the React viewer shell, sidebar navigation, aggregate workspace views, project overview behavior, and related styles.

## Milestone Strategy

1. Land the Keendoc redesign baseline.
2. Verify the viewer still serves project contracts and source documents.
3. Iterate the navigation model after live visual feedback.
4. Record validation evidence in Delano contracts.

## Rollout Strategy

- Keep changes local to `.delano/viewer`.
- Preserve existing API endpoints and read-only behavior.
- Validate in the already-running local viewer before claiming completion.

## Test Strategy

- Browser smoke test `http://127.0.0.1:3977/`.
- Confirm global workspace views switch without console errors.
- Confirm progress pagination appears when aggregate progress exceeds one page.
- Run `bash .agents/scripts/pm/validate.sh` after contract changes.

## Rollback Strategy

- Revert `.delano/viewer/public/app.jsx` and `.delano/viewer/public/styles.css` changes for the navigation model.
- Keep contract evidence if the redesign decision is superseded by a later task.

## Remaining Delivery Risks

- The selected-project source-contract list may still belong in the main project overview instead of the sidebar.
- The workspace aggregate model depends on existing role/status metadata quality.
