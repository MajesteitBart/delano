---
name: Delano Viewer
slug: delano-viewer
owner: bart
status: complete
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T21:57:54Z
outcome: Delano has a read-only local viewer on a high-3000s port that makes `.project` content easy to navigate by project, status, workstream, task, and rendered markdown document without mutating delivery state.
uncertainty: low
probe_required: false
probe_status: completed
---

# Spec: Delano Viewer

## Executive Summary
- Build a minimal, sleek, read-only frontend for Delano-generated `.project` content.
- Keep it local and lightweight: a plain Node server plus static frontend under `.delano/viewer`, launched with `npm run viewer`.
- Prioritize process navigation over generic file browsing: projects should expose specs, plans, progress, decisions, workstreams, tasks, status, and rendered markdown in one clean reading surface.
- Capture the already-built prototype and remaining polish as Delano project contracts so progress and quality evidence are no longer informal.

## Problem and Users
- Delano produces durable markdown contracts, but reading `.project` directly in the filesystem makes it hard to follow current process, task progress, and workstream structure.
- Primary users are Delano operators and maintainers who need a fast local way to inspect delivery state while preserving `.project` as the canonical source of truth.
- Secondary users are coding agents and reviewers who need to understand current scope, progress, and evidence without editing files through the viewer.

## Outcome and Success Metrics
- `npm run viewer` starts a local read-only viewer on `http://127.0.0.1:3977` by default, with `DELANO_VIEWER_PORT` or `PORT` override support.
- The viewer indexes `.project/context`, `.project/templates`, and `.project/projects` markdown files.
- Project views expose a right-side outline containing spec, plan, decisions/progress, workstreams, and grouped tasks.
- Filters are context-aware: irrelevant status filters are hidden or reset when switching folder or project.
- Markdown is rendered in a clean reading pane with frontmatter/properties visible.
- Convenience actions can open the selected markdown file's containing folder or VS Code while still preventing edits inside the viewer itself.
- Validation evidence exists for syntax, tests, API smoke checks, and at least one browser/visual pass before closeout.

## Scope
### In Scope
- Local `.delano/viewer` server and static frontend.
- Read-only indexing and document APIs for markdown files inside `.project`.
- Rendered markdown reading experience.
- Project/folder navigation, search, role filters, status filters, and workstream focus behavior.
- Artifact role detection for `spec`, `plan`, `workstream`, `task`, `progress`, `decision`, `context`, and `template`.
- Workstream/task grouping and right-side project outline navigation.
- Fixed-height pills/badges and small UX polish identified during prototype review.
- "Open in system explorer" and "Open in VS Code" convenience actions guarded to markdown files inside `.project`.
- Documentation and tests/smoke evidence for the viewer.

### Out of Scope
- In-browser editing of `.project` content.
- Replacing `.project` contracts, PM scripts, or the Delano CLI.
- Multi-user hosting, authentication, remote sync, or persistence outside the repository.
- A full Tolaria clone or adoption of Tolaria internals.
- A separate packaged web app unless a later project deliberately promotes the viewer out of `.delano/viewer`.

## Functional Requirements
- Serve static frontend files and JSON APIs from `.delano/viewer/server.js`.
- Walk `.project` markdown files without traversing outside the project root.
- Return a document index with derived title, role, status, project slug, task ID, workstream ID, dependencies, update timestamp, relationships, snippet, and source path.
- Return individual markdown documents with frontmatter, body, and rendered content data needed by the client.
- Group project artifacts into an outline with spec, plan, progress, decisions, workstreams, tasks, and unassigned tasks.
- Reset filters and workstream scope when switching project/folder.
- Hide status filters when the selected folder has no status-bearing documents.
- Keep cards, badges, and reader actions visually stable when titles wrap.
- Provide guarded open actions for system explorer and VS Code.

## Non-Functional Requirements
- Read-only by default and by design; no viewer API may write `.project` state.
- Minimal dependency footprint; plain Node and static assets are acceptable for the current scope.
- High-3000s default port that is unlikely to collide with common dev servers.
- Clean, restrained, dense enough for repeated operator use.
- Local paths must not leak into committed contracts or docs.
- The implementation should be auditable and easy to remove or promote later.

## Hypotheses and Unknowns
- A plain Node server plus static frontend is sufficient for the local viewer use case.
- Delano project files can be classified accurately enough from relative paths and frontmatter without a heavier parser.
- Workstream/task relationships can be inferred from task metadata and content until stronger linking contracts exist.
- Browser visual verification may require a local Playwright setup or a manually opened browser if automation is blocked.
- The final home for the viewer may remain `.delano/viewer` or move into a formal package/app in a later project.

## Touchpoints to Exercise
- `.delano/viewer/server.js`
- `.delano/viewer/public/index.html`
- `.delano/viewer/public/app.js`
- `.delano/viewer/public/styles.css`
- `.delano/viewer/README.md`
- `package.json`
- `test/`
- `.project/projects/*`
- `.project/context/*`
- `.project/templates/*`

## Probe Findings
- A first prototype already exists under `.delano/viewer`.
- `package.json` exposes `npm run viewer`.
- The default port is `3977`, with environment override support.
- The server currently indexes markdown contracts, derives roles and project outlines, serves `/api/index`, `/api/doc`, and guarded `/api/open` endpoints, and serves static frontend files.
- The UI already supports project/folder navigation, search, context-aware filters, rendered markdown, right-side outlines, workstream focus, fixed-height pills, and open actions.
- A local server check on 2026-04-28 confirmed `/api/index` returns HTTP 200.

## Footguns Discovered
- A viewer that acts like a generic document browser does not expose enough process/progress structure for Delano operators.
- Status filters are confusing when shown for context or template folders that do not use task-style statuses.
- Workstream/task navigation needs to be explicit or users cannot tell how tasks relate to delivery streams.
- Open-in-editor convenience must stay guarded so the read-only viewer does not become a broad filesystem launcher.
- Visual polish issues such as stretching pills can make the interface feel unstable even when functionality works.

## Remaining Unknowns
- Whether the current inferred workstream/task grouping is sufficient for all existing and future Delano projects.
- Whether Tolaria or Pencil-inspired design tooling should influence a future formal design pass, or remain just research input for this prototype.
- Whether the viewer should eventually be included in install assets or documented as an optional local tool.
- Whether browser automation can be made reliable enough to become part of the normal viewer quality gate.

## Dependencies
- Node.js 18 or newer.
- The existing Delano `.project` contract layout.
- The `code` CLI for VS Code open actions, when that button is used.
- A system opener such as Windows Explorer, `open`, or `xdg-open` for folder open actions.
- Existing `npm test` and PM validation commands for quality evidence.

## Approval Notes
- This project is created after prototype work has already started. The spec records the intended outcome and current known state so planning, breakdown, execution evidence, and closeout can proceed through Delano contracts.
- `probe_required: false` because the prototype itself has already exercised the riskiest assumptions. `probe_status: completed` records that research/prototype discovery has happened outside the formal contract and is now being brought under project tracking.
