---
name: Delano Viewer
status: done
lead: bart
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T21:57:54Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: approved
---

# Delivery Plan: Delano Viewer

## What Changed After Probe
- The viewer already moved through three informal prototype passes before this Delano project was created.
- The first pass established the local read-only server, markdown indexing, rendered reader, search, status filtering, and default high-3000s port.
- The second pass shifted the model from document browser to process/progress navigator with artifact roles, project outlines, context-aware filters, and workstream/task grouping.
- The third pass addressed visual stability for pills/badges and added guarded open-in-explorer and open-in-VS-Code actions.
- Planning now focuses on documenting the built surface, finishing quality evidence, and identifying the remaining hardening needed before closeout.

## Architecture Decisions
- Keep the viewer in `.delano/viewer` for this project rather than promoting it into a separate package or application.
- Use a plain Node HTTP server and static frontend to preserve a small operational footprint.
- Treat `.project` markdown files as read-only source material; the viewer may read, classify, render, and open files externally but may not write delivery state.
- Derive roles and outlines server-side so the frontend receives a useful project model instead of raw file paths only.
- Use guarded local open endpoints for editor/explorer convenience, constrained to markdown files inside `.project`.
- Keep the default port at `3977`, with environment overrides for collision handling.

## Probe-Driven Architecture Changes
- Added artifact role detection and project outline generation after the first prototype proved generic document lists were insufficient.
- Added filter reset and context-aware status filter visibility after folder switching exposed stale filter states.
- Added workstream focus behavior so selecting a workstream reveals and filters to subtasks.
- Added fixed-height pills and reader actions after visual review of wrapped titles and edit-flow convenience needs.

## Workstream Design
- `WS-A Viewer Runtime and Index API`: own the local server, markdown walking, frontmatter parsing, API shape, safe path handling, and open endpoints.
- `WS-B Process Navigation UX`: own the frontend model, project/folder navigation, context-aware filters, project outline, workstream/task grouping, and reader workflow.
- `WS-C Visual Polish and Readability`: own the minimal visual system, responsive layout, badge stability, full markdown rendering compatibility, final design polish after input is received, and clean operator experience.
- `WS-D Validation, Documentation, and Closeout`: own README/user guidance, test evidence, browser/API smoke checks, and final readiness decisions.

## Milestone Strategy
1. Record the existing prototype baseline in formal project contracts.
2. Confirm runtime and API behavior through tests and smoke checks.
3. Complete a browser/visual pass and fix any obvious layout defects.
4. Decide whether the viewer is ready to close as an optional local tool or needs a follow-up packaging/install project.

## Rollout Strategy
- Keep the viewer opt-in through `npm run viewer` while it stabilizes.
- Do not add write APIs or automatic launch behavior.
- Keep docs precise about read-only behavior, default port, override variables, and open-action limits.
- If quality gates pass, close this project with the viewer as a documented local repo tool.

## Test Strategy
- Run `node --check` on `.delano/viewer/server.js` and `.delano/viewer/public/app.js`.
- Run `npm test`.
- Run `bash .agents/scripts/pm/validate.sh` after contract changes.
- Start the viewer on a non-conflicting port and smoke test `/api/index` and at least one `/api/doc` request.
- Perform a browser visual pass for desktop and, if feasible, a narrow viewport to catch overlap, wrapping, empty-state issues, markdown rendering gaps, and final design polish regressions.
- Verify that `/api/open` rejects invalid paths and remains constrained to `.project` markdown files.

## Rollback Strategy
- The viewer is isolated under `.delano/viewer` plus a package script. If it proves unsafe, remove the viewer directory and `viewer` script without changing core Delano runtime contracts.
- Because the viewer does not write `.project`, rollback does not require data migration.
- Keep this project's `.project` artifacts as the evidence trail even if implementation is reverted or redesigned later.

## Remaining Delivery Risks
- Inferred task/workstream grouping may misclassify files until stronger metadata conventions exist.
- The static markdown renderer may be too limited for future contract content.
- Browser automation may not be stable in every local agent environment.
- Open actions depend on local tools being available and should fail clearly when they are not.
- Packaging/install inclusion is deferred. The viewer remains an optional local repo tool unless a later project promotes it into install assets.
