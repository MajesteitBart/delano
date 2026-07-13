---
id: WS-A
name: WS-A Delivery
owner: bart
status: done
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T13:42:01Z
operating_mode: feature
---

# Workstream: WS-A Delivery

## Objective

Deliver the repository/worktree-aware viewer as one sequential stream: shared Git/registry/coordination domain and CLI, guarded viewer context with persistent provenance, schema-driven task filtering with a complete Tasks view, and final verification, packaging, and documentation.

## Owned Files/Areas

- `src/cli/` command dispatch, commands, and lib helpers plus CLI tests and fixtures.
- `.agents/scripts/` worktree, validation, and coordination paths.
- `.delano/viewer/server.js`, viewer UI source, and viewer tests.
- `docs/`, `.delano/viewer/public/`, `assets/payload/`, and this project's evidence logs.

## Dependencies

- Git common-directory and worktree porcelain behavior.
- Existing Delano-root resolution, viewer containment/watch/write guards, and TanStack table behavior.
- Canonical artifact schemas under `.agents/schemas/artifacts/`.

## Risks

- Incorrect primary-worktree resolution can duplicate registry entries or expose unrelated paths.
- Stale async responses or watcher events across a context switch can leak data or weaken write guards.
- Filtering display labels instead of raw values, or UI fallback constants, would fork the canonical schemas.
- Generated viewer/package artifacts can drift from canonical source if rebuilt mid-delivery.

## Handoff Criteria

- All six tasks meet their acceptance criteria in dependency order.
- CLI, server, UI, package, schema, and contract gates pass with recorded output.
- Browser smoke evidence covers switching, provenance, divergence, task status filtering, refresh, and console health.
- Documentation explains registry privacy, data-source semantics, linked-worktree read-only behavior, coordination location, and recovery/forgetting.

## Updates

- 2026-07-13T11:37:49Z: Delivery execution started; T-001 is dependency-free and readiness-reviewed.
