---
id: WS-C
name: WS-C Workflow Views
owner: Bart
status: planned
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
operating_mode: feature
---

# Workstream: WS-C Workflow Views

## Objective

Deliver the four operator workflows—Home orientation, recent delivery Review, Should/Can/Could Plan, and Git-provenanced Updated Files—on the approved design and shared data/query foundation.

## Owned Files/Areas

- `.delano/viewer/ui/src/pages/HomePage.tsx`
- `.delano/viewer/ui/src/pages/ReviewPage.tsx`
- `.delano/viewer/ui/src/pages/PlanPage.tsx`
- `.delano/viewer/ui/src/pages/UpdatedFilesPage.tsx`
- `.delano/viewer/ui/src/components/organisms/FileActivityInspector.tsx`
- Page-local components and tests that do not alter shell routing

## Dependencies

- T-002 Git/evidence data for Home, Review, and Updated Files
- T-003 shared query controls and work selectors
- Approved six-screen design system from T-001

## Risks

- Home can become an undifferentiated dashboard if every source competes equally.
- Review must not imply task-to-commit causality without evidence.
- Should/Can/Could can be mistaken for lifecycle state unless definitions stay visible and neutral.

## Handoff Criteria

- Each page is functional in isolation with loading, empty, error, dense, and narrow states.
- Page tests demonstrate the spec's data semantics and approved composition.
- Shell integration requires route/navigation work only, not page redesign or selector rework.
