---
id: WS-B
name: WS-B Data and Table Foundation
owner: Bart
status: planned
created: 2026-07-10T07:59:23Z
updated: 2026-07-10T07:59:23Z
operating_mode: feature
---

# Workstream: WS-B Data and Table Foundation

## Objective

Provide trustworthy, bounded repository activity data and one reusable interaction model for finding, filtering, sorting, and deriving work across all viewer tables and workflow pages.

## Owned Files/Areas

- `.delano/viewer/server.js`
- `test/viewer-server.test.js`
- `.delano/viewer/ui/src/lib/domain/**`
- `.delano/viewer/ui/src/components/molecules/**` for shared table controls
- Focused domain fixtures/check scripts

## Dependencies

- T-001 user-approved design gate
- Existing viewer index, safe process-spawn patterns, pagination helper, shadcn inputs/selects/popovers/tables

## Risks

- Git output parsing can mishandle renames, unicode, or combined staged/unstaged state.
- An over-general table component can restrict view-specific cell rendering.
- Client/server type drift can silently corrupt dependency or priority derivation.

## Handoff Criteria

- Git activity/evidence payload is bounded, read-only, repo-relative, and fixture-tested.
- Shared query/selectors are pure, deterministic, accessible at the control layer, and tested before any workflow view consumes them.
- T-004 through T-007 can build without changing foundational semantics.
