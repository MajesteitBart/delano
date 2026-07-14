---
id: WS-A
name: WS-A Review Mode and Project Dashboard
owner: bart
status: done
created: 2026-07-13T21:58:47Z
updated: 2026-07-13T22:28:06Z
operating_mode: feature
---

# Workstream: WS-A Review Mode and Project Dashboard

## Objective

Deliver explicit, non-destructive Review behavior and replace the project file inventory with a trustworthy, source-linked delivery dashboard, with automated and live-browser evidence.

## Owned Files/Areas

- `.delano/viewer/ui/src/pages/DocumentReaderPage.tsx`
- `.delano/viewer/ui/src/components/organisms/MarkdownArticle.tsx`
- `.delano/viewer/ui/src/components/organisms/AnnotationDrawer.tsx`
- `.delano/viewer/ui/src/pages/ProjectPages.tsx`
- `.delano/viewer/ui/src/lib/domain/` dashboard derivation and tests
- `.delano/viewer/ui/src/index.css`
- Viewer documentation and generated public assets
- This project’s tasks, updates, evidence, and decisions

## Dependencies

- Approved `spec.md` and delivery plan.
- Existing annotation API, indexed project documents, and semantic routes.
- Review boundary precedes overlay verification; dashboard model precedes dashboard composition; quality/closeout follows both surfaces.

## Risks

- Adjacent user-owned viewer changes share some source and generated files.
- Read-only worktree behavior can regress if visibility and write capability are conflated.
- Dashboard visuals can overstate delivery knowledge if snapshot data is treated as history.

## Handoff Criteria

- Every task is closed with command or browser evidence.
- Default reading selection, writable Review, and read-only Review satisfy their distinct acceptance scenarios.
- Drawer geometry remains stable and dashboard edge cases are verified in T3.
- Viewer source, generated assets, docs, package checks, and Delano contracts agree.
- Remaining baseline failures or unrelated dirty files are explicitly reported rather than overwritten.
