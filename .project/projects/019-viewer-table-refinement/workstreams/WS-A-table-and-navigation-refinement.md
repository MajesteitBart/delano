---
id: WS-A
name: WS-A Table and Navigation Refinement
owner: bart
status: done
created: 2026-07-13T20:18:44Z
updated: 2026-07-13T21:13:56Z
operating_mode: feature
---

# Workstream: WS-A Table and Navigation Refinement

## Objective

Deliver a single-boundary ledger table system with explicit project navigation, chronological defaults, schema-aware searchable filters, date ranges, and linked-research browser evidence.

## Owned Files/Areas

- `.delano/viewer/ui/src/components/molecules/DataTable.tsx`
- `.delano/viewer/ui/src/components/ui/table.tsx`
- `.delano/viewer/ui/src/components/ui/calendar.tsx`
- `.delano/viewer/ui/src/lib/data-table.ts`
- `.delano/viewer/ui/src/lib/domain/**`
- `.delano/viewer/ui/src/pages/**`
- `.delano/viewer/ui/src/app/**`
- `.delano/viewer/server.js`
- Viewer tests, documentation, compiled assets, and package payload

## Dependencies

- Existing viewer navigation/research changes in `018-viewer-navigation-research`.
- TanStack React Table and project-aware shadcn source components.

## Risks

- Shared table changes can affect every dense viewer surface.
- Date boundaries and local timezone handling can introduce off-by-one-day filtering.
- The shared preview process must be restarted without disturbing unrelated processes.

## Handoff Criteria

- T-001 through T-005 are done with focused, full-suite, browser, package, and release evidence.
- Shared preview on port 3978 runs current source and linked research shows six documents.

## Updates

- 2026-07-13T20:52:09Z: Workstream lifecycle corrected to active after generated ready state blocked contract validation.

- 2026-07-13T20:50:53Z: Implementation and release verification are in progress.

- 2026-07-13T20:19:50Z: T-001 is dependency-safe and implementation boundaries are defined.
