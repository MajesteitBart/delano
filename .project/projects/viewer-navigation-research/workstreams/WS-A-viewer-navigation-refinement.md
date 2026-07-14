---
id: WS-A
name: WS-A Viewer Navigation Refinement
owner: bart
status: done
created: 2026-07-13T17:56:30Z
updated: 2026-07-13T18:27:26Z
operating_mode: feature
---

# Workstream: WS-A Viewer Navigation Refinement

## Objective

Deliver research visibility, intent-preserving project/worktree navigation, and the requested six-entry Workspace information architecture as one verified viewer change.

## Owned Files/Areas

- `.delano/viewer/server.js` project indexing and outlines.
- `.delano/viewer/ui/src/lib/domain/` navigation, types, and workspace model.
- Viewer navigation hook, Sidebar, route composition, Project pages, and focused component/domain fixtures.
- `test/viewer-server.test.js`, viewer documentation, compiled public assets, package payload, and project evidence.

## Dependencies

- Existing Markdown walker, context generation model, and project outline payload.
- Existing project selector, context switcher, document table, local-storage navigation, and annotation summary.

## Risks

- Route preservation must never retain a stale document outside the active index.
- Research role precedence and removed-route migration are compatibility-sensitive.
- Workspace count labels must change without changing the all-status Tasks dataset.

## Handoff Criteria

- Nested research files are visible in one selected-project Research view in primary and linked worktrees.
- Project and context changes preserve the closest valid route and never show stale documents.
- Workspace matches the exact requested order and open-count semantics at desktop and mobile sizes.
- Focused tests, full tests, build, package drift, release validation, and browser evidence pass.

## Updates

- 2026-07-13T18:00:23Z: Validated single-stream plan is ready for execution.
