---
name: Repository and Worktree-aware Viewer
status: done
lead: bart
created: 2026-07-13T10:37:40Z
updated: 2026-07-13T13:42:01Z
linear_project_id:
risk_level: high
spec_status_at_plan_time: active
operating_mode: feature
---

# Delivery Plan: Repository and Worktree-aware Viewer

## What Changed After Probe

No prototype probe was required. Source review expanded the draft with persistent data provenance, an all-status Tasks ledger, schema-derived selectable filters, and primary-only viewer writes. A 2026-07-13 condensation pass then downgraded the project from multi-stream to feature mode: the dependency graph is nearly linear with one owner, so the work now runs as one stream of six sequential tasks with three simplifying decisions (full-reset context switching, schema options on the existing index payload, one consolidated browser smoke run).

## Technical Context

The CLI launches one dependency-free viewer server with a fixed `DELANO_VIEWER_ROOT`. The server indexes one `.project/` tree and owns containment, hash, event, annotation, handover, and apply state. The React viewer derives workspace/task models from `/api/index`. Its shared TanStack DataTable renders a text input for every filterable column. Artifact enums already exist in `.agents/schemas/artifacts/*.schema.json` and remain authoritative.

## Architecture Decisions

- Add reusable Node domain modules for registry persistence, Git repository identity, worktree parsing, divergence, and coordination-path resolution; CLI commands and the viewer server consume the same modules.
- The home registry is disposable machine-local metadata (version, repository identity, canonical primary path, display name, last-seen). Atomic temp-write-and-rename, last-writer-wins, no locking.
- Repository identity and primary worktree resolve server-side. Selection is an opaque repository ID plus a member of a fresh Git-reported inventory, never a browser-supplied path.
- Context switch is a full teardown and reinitialize of all root-scoped server state (index, watchers, caches, write baselines) guarded by a generation token that invalidates late responses and events. No per-subsystem parameterization; requests during a switch receive an explicit retry response.
- Existing viewer writes stay available only when the selected worktree is primary; linked-worktree context is inspect-only.
- Project-state status derives from committed `.project/` differences relative to the primary worktree plus local uncommitted changes; unavailable/missing is distinct from clean/diverged/dirty.
- Coordination state resolves through the Git common directory; migration covers recognized legacy files only, with recoverable, idempotent operations.
- Artifact enum metadata from the selected root's schemas rides the existing context/index payload — no dedicated endpoint, no parallel status types or arrays in the UI.
- DataTable column metadata generalizes to select/multi-select filters with exact raw-value membership; free-text filters remain for unconstrained columns.
- The workspace route renames to Tasks with a versioned navigation-state migration/fallback for stored `workspace-current` state.
- The repository and worktree switchers sit at the top of the sidebar, above the Workspace section, as searchable comboboxes following the shadcn/Radix combobox pattern (popover plus filterable command list), reusing the selected-project dropdown's visual language. Add the popover/command primitives only if the viewer does not already ship them.
- The sidebar's per-update Progress file list collapses into one Progress entry presented like Decisions; the progress view it opens lists every update.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth.
- [x] Probe decision is explicit.
- [x] Evidence gates are defined before handoff.
- [x] External sync writes require dry-run or operator approval.
- [x] Artifact status/type values remain owned by `.agents/schemas/artifacts/`.
- [x] Repository/worktree switching does not broaden viewer write permissions.

## Generated Artifact Map

- `spec.md`: Reviewed source draft reconciled with current viewer/server/schema behavior; condensed 2026-07-13.
- `plan.md`: Single-stream feature plan derived from the active spec.
- `workstreams/`: One delivery stream (WS-A) covering the whole feature.
- `tasks/`: Six planned, dependency-safe implementation and verification units with binary acceptance criteria.

## Complexity Exceptions

- `T-003` is XL because the active-context refactor plus schema-option transport crosses indexing, caching, events, annotations, and write safety in one server boundary; splitting it would create an unsafe partially switched server. The full-reset switch design bounds this complexity.

## Probe-Driven Architecture Changes

- None. The probe was explicitly skipped; decisions come from current-source inspection and bounded fixture-led design.

## Workstream Design

- `WS-A Delivery`: one stream, one owner, six tasks in dependency order. Registry/CLI and coordination/validation land first, then the guarded viewer context server and its UI, then filters and the Tasks view, then verification, packaging, and documentation. WS-A owns generated/package artifacts at the end so nothing rebuilds them mid-delivery.

## Milestone Strategy

1. Repository identity, registry, worktree discovery, CLI surfaces, shared coordination paths, and validation behavior (T-001, T-002).
2. Guarded viewer context APIs with schema options, and the repository/worktree switcher UI (T-003, T-004).
3. Schema-driven filters, the complete Tasks overview, and end-to-end verification, packaging, and documentation (T-005, T-006).

## Rollout Strategy

- Land registry/worktree libraries, CLI commands, coordination resolver, and validation checks without changing existing single-root viewer behavior.
- Add server context APIs defaulting to the launch repository's primary worktree, preserving a valid initial experience; enable the UI switcher and Tasks/filter changes after API contracts are covered by server tests.
- Rebuild the viewer and package payload only after source-level tests pass; publish is outside this project unless separately authorized.

## Test Strategy

- Unit fixtures for registry atomicity/pruning, Git common-dir identity, porcelain parsing (detached/missing/spaced paths), divergence, dirty state, and coordination migration.
- CLI tests for registration policy, `repos`, `repos --forget`, `worktrees`, validation override, help, and failure messages.
- Viewer server tests for context inventory/switching, arbitrary-root rejection, per-root isolation across a switch, stale selections, linked-worktree write rejection, and schema-option loading.
- Viewer domain/component tests for context-state reset, route fallback, schema-option filter metadata, exact multi-select behavior, and all-status task derivation.
- One consolidated browser smoke run delegated through `codex exec` per repository policy: switch repositories/worktrees, inspect provenance/divergence, use task status filters, refresh, and verify zero console errors.
- `npm test`, viewer build/type-check, `npm run build:assets`, `npm run check:package-manifest`, `delano validate`, and release validation after payload generation.

## Rollback Strategy

- Registry metadata is disposable and can be removed without changing repository delivery data.
- The launch repository remains the initial/default viewer context, so the switcher can be disabled independently.
- Coordination migration is idempotent and recognizes legacy files during a compatibility window; unrecognized `.project/` content is never deleted.
- Tasks navigation/filter UI can revert independently while retaining server schema metadata.
- Prior compiled assets stay in place until the new viewer source passes server, UI, browser, and package gates.

## Remaining Delivery Risks

- Late async responses or watcher events across a context switch could show stale data or weaken write guards; the generation token and integration tests are mandatory.
- Windows path canonicalization, spaces, symlinks, detached HEAD, and prunable worktrees can break naive identity/containment logic.
- Legacy coordination migration must stay idempotent under concurrent callers.
- Schema availability can differ in stale consumer repositories; failure must be explicit rather than silently inventing filter options.
- Browser-local navigation state references workspace and document paths without repository identity and needs a versioned migration.
