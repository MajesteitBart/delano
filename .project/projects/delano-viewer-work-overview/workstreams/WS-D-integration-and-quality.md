---
id: WS-D
name: WS-D Integration and Quality
owner: Bart
status: planned
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
operating_mode: feature
---

# Workstream: WS-D Integration and Quality

## Objective

Integrate the new workflows and universal table controls into the existing shell, preserve current routes and reader/editor behavior, and produce release-quality validation and browser evidence.

## Owned Files/Areas

- `.delano/viewer/ui/src/app/**`
- `.delano/viewer/ui/src/components/organisms/{Sidebar,AppShell,Topbar}.tsx`
- `.delano/viewer/ui/src/pages/{WorkspacePage,ProjectPages}.tsx`
- `.delano/viewer/ui/src/index.css`
- `.delano/viewer/public/**` and `assets/payload/**` during the final build only
- Release tests and repo-relative browser evidence

## Dependencies

- T-004 through T-007 complete and independently verified
- Existing browser delegation rule and package build pipeline

## Risks

- Default-route and navigation-state changes can break project/document restoration.
- Applying controls to legacy tables can introduce pagination regressions.
- Generated public/package assets can drift from source if built out of order.

## Handoff Criteria

- New and legacy routes share one coherent shell on desktop and compact layouts.
- Every table satisfies the same interaction contract without reader/editor regression.
- All relevant automated, package, contract, and delegated browser gates are evidenced and the working tree is understood.
