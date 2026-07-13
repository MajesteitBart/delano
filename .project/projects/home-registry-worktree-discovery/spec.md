---
name: Repository and Worktree-aware Viewer
slug: home-registry-worktree-discovery
owner: bart
status: complete
created: 2026-07-13T10:37:40Z
updated: 2026-07-13T13:42:01Z
outcome: Users can identify and switch the repository and worktree that supply viewer data, understand project-state location and divergence, inspect every task by canonical status, and coordinate safely across worktrees.
uncertainty: medium
probe_required: false
probe_status: skipped
probe_decision_rationale: Existing Git porcelain, viewer indexing, TanStack tables, and artifact schemas provide bounded implementation paths; fixture-led integration tests are sufficient.
source_review: Reviewed from the 2026-07-13 draft "Delano home registry and worktree discovery" and reconciled with the current CLI, viewer, and artifact schemas. Condensed 2026-07-13 to a single-stream feature contract with the same outcome.
operating_mode: feature
---

# Spec: Repository and Worktree-aware Viewer

## Executive Summary

Make the Delano viewer explicit about which repository, Git worktree, and `.project/` tree it is showing. Add a machine-local repository registry, discover linked worktrees from Git, expose project-state divergence, and move runtime coordination state to the shared Git common directory. Replace the misleading “Open work” view with a complete Tasks overview whose table filters use selectable values derived from the existing artifact schemas.

## Problem and Users

Delano delivery state belongs to a repository, but users and agents work through multiple linked worktrees. The viewer starts with one fixed `DELANO_VIEWER_ROOT`, gives little context about that root, and cannot explain whether another worktree carries different `.project/` progress. Coordination files under a worktree-local `.project/` tree are invisible to sibling worktrees. “Open work” hides completed tasks and so cannot serve as the task ledger, and table filters accept free text even for fields with canonical enums in `.agents/schemas/artifacts/`.

Primary users: operators reviewing delivery state across repositories, and coding agents coordinating through linked worktrees.

## Outcome and Success Metrics

- Every viewer screen identifies the selected repository and worktree by name/root, path, branch or detached state, HEAD, and primary/linked role.
- The viewer states which `<selected-worktree>/.project/` tree supplies displayed data and shows clean/diverged/dirty status relative to the primary worktree.
- Registered repositories and every live Git-reported worktree can be selected without restarting the viewer or per-worktree configuration.
- The workspace Tasks view includes all indexed tasks (including `done` and `deferred`) and filters by the exact statuses in `task.schema.json`.
- Option filters reuse enum values from the artifact schemas; no UI-owned status/type unions or duplicated option arrays exist.
- Linked worktrees share coordination state through the Git common directory, and validation rejects uncommitted `.project/` changes in linked worktrees unless explicitly overridden.
- CLI, viewer server, viewer UI, package, and contract validation suites cover the new behavior and pass before release.

## User Stories

- US-001: As an operator, I want Delano to remember repositories and discover their worktrees, so that I can find delivery state regardless of where a tool created the checkout.
- US-002: As a reviewer, I want persistent repository, worktree, and project-data provenance in the viewer, so that I always know what source and progress I am inspecting.
- US-003: As a delivery lead, I want one complete Tasks overview with canonical selectable filters, so that I can inspect task state without guessing filter terms or losing completed work.
- US-004: As an agent working in a linked worktree, I want shared coordination and clear divergence warnings, so that claims are visible across worktrees and durable project state is not edited accidentally in the wrong checkout.

## Acceptance Scenarios

- AC-001: Given repositories A and B have each successfully launched Delano, when the viewer opens, then both repositories are selectable and the current repository is visibly identified by name and canonical primary path.
- AC-002: Given a linked worktree created by any Git-aware tool, when its registered repository is selected, then the worktree appears from `git worktree list --porcelain` with path, branch or detached state, HEAD, primary/linked role, and project-state availability.
- AC-003: Given a linked worktree whose committed or uncommitted `.project/` content differs from the primary worktree, when it is selected, then the viewer shows the selected data source and distinguishes clean, diverged, and dirty state.
- AC-004: Given a linked worktree has uncommitted `.project/` changes, when `delano validate` runs, then validation fails unless `--allow-worktree-state` was supplied.
- AC-005: Given a user switches repository or worktree, when the viewer reloads its index, then every read is contained to the selected Git-reported root, stale selections fail visibly, and canonical write actions are unavailable outside the primary worktree.
- AC-006: Given two worktrees of one repository, when either agent creates or updates supported leases, locks, conflict records, or handoff coordination, then both worktrees observe the same state under the Git common directory; legacy coordination files migrate safely with a one-line notice.
- AC-007: Given a table column maps to a schema field with an enum, when its filter opens, then selectable options are derived from that artifact schema, preserve canonical raw values, support multi-select and clear, and do not rely on a separately maintained UI list.
- AC-008: Given tasks across every canonical task status, when the user opens the workspace Tasks view, then all tasks are present and can be filtered by one or more canonical task statuses, while project and workstream navigation remains available from each row.
- AC-009: Given a project with one or more progress updates, when the sidebar renders, then a single Progress entry appears (presented like Decisions) that opens the progress view; individual update files are not listed as separate sidebar items.

## Scope

### In Scope

- Machine-local repository registry with lazy stale-entry pruning, listing/forgetting, and successful-command registration.
- Git porcelain worktree discovery, primary-worktree resolution, `.project/` availability, and divergence/dirty derivation.
- Guarded viewer APIs and UI for repository/worktree selection and persistent data provenance; linked worktrees are read-only, canonical writes stay primary-only.
- Shared coordination storage under the Git common directory with idempotent legacy migration and validation checks.
- A complete workspace Tasks view replacing “Open work,” with option-based TanStack filters sourced from `.agents/schemas/artifacts/*.schema.json` enums.
- Sidebar cleanup: repository and worktree switchers above the Workspace section, and one Progress entry replacing the per-update-file list.
- CLI, server, UI, fixture, documentation, package, and release validation updates.

### Out of Scope

- Creating, moving, deleting, or choosing a centralized storage root for Git worktrees.
- Automatically reconciling or repairing `.project/` divergence.
- Combining projects from multiple repositories into one cross-repository table.
- New artifact type definitions, status vocabularies, or UI-owned copies of schema enums.
- Changing durable `.project/` contract ownership or making the home registry a source of delivery truth.
- Remote repository discovery, cloud synchronization, or tracker mutations.

## Functional Requirements

- FR-001: Store a versioned registry at the Delano home location with a repository ID derived from the resolved Git common directory, canonical primary path, display name, and `lastSeen` timestamp.
- FR-002: Registry reads lazily remove missing repository paths; writes use atomic temp-write-and-rename. Last-writer-wins is acceptable — the registry is regenerable metadata and needs no locking.
- FR-003: `delano repos` lists registered repositories, `delano repos --forget <path>` removes one, and `delano worktrees` lists the current repository's live worktrees and project-state status.
- FR-004: Registration from a linked worktree resolves the repository's primary worktree instead of creating a duplicate registry entry.
- FR-005: Worktree parsing handles branch, detached HEAD, missing/prunable entries, spaces, and platform path forms using Git porcelain output.
- FR-006: Viewer selection accepts only an opaque registered repository identity and a worktree returned by Git for that repository; arbitrary client-provided filesystem roots are rejected.
- FR-007: The viewer context surface identifies repository, worktree, branch/detached state, HEAD, primary/linked role, selected `.project/` path, availability, and divergence/dirty status.
- FR-008: Switching context resets or safely revalidates selected project/document routes, annotations, live events, activity, and write guards against the new root. A full teardown-and-reinitialize of root-scoped server state, with a generation token invalidating late responses, satisfies this.
- FR-009: Existing canonical apply, annotation, and handover writes do not target linked worktrees; the UI explains why those actions are disabled.
- FR-010: Runtime coordination paths resolve beneath `<git-common-dir>/delano/` for all worktrees of one repository, with safe one-time migration of recognized legacy files only.
- FR-011: Validation fails for uncommitted `.project/` changes in a linked worktree, supports the explicit `--allow-worktree-state` override, and warns about recognized legacy coordination files.
- FR-012: The workspace navigation label and page title become “Tasks”; its dataset is the complete indexed task set rather than the prior non-done subset.
- FR-013: Artifact filter options are extracted from the selected repository's existing JSON schemas and exposed through the existing viewer context/index payload — no dedicated endpoint, no generated replacement TypeScript unions, and no fallback status arrays.
- FR-014: The shared DataTable supports text filters for unconstrained fields and accessible selectable/multi-select filters for schema-constrained fields.
- FR-015: Task status filtering compares canonical raw values, while display labels may continue to use existing presentation helpers.
- FR-016: The repository switcher and the worktree switcher render at the top of the sidebar, above the Workspace section, styled like the existing selected-project dropdown but implemented as searchable comboboxes following the shadcn/Radix combobox pattern (popover plus filterable command list).
- FR-017: The sidebar shows one Progress entry, presented like the Decisions entry, instead of listing each progress update file; the progress view it opens still exposes every update.

## Non-Functional Requirements

- The viewer remains localhost-only and does not expose or traverse paths outside registered repositories and Git-reported worktrees.
- Registry paths and worktree paths remain machine-local and are never committed to repository contracts or logs.
- Git and filesystem failures produce visible, actionable unavailable states rather than silently falling back to another repository or worktree.
- Context switches must not leak cached index, document, annotation, activity, or write-baseline state from the previous root.
- Schema loading failures are explicit; the UI must not silently substitute a hand-maintained option list.
- Existing free-text filtering, sorting, pagination, keyboard access, responsive behavior, and viewer safety guards remain functional.

## Assumptions

- Git is available wherever worktree discovery or divergence checks run.
- Registered repositories are non-bare Delano repositories with a primary worktree; bare repositories may be listed as unavailable rather than indexed.
- The installed repository contains the canonical artifact schemas under `.agents/schemas/artifacts/`.
- The supplied source draft is approved as discovery input; this contract clarifies current viewer write behavior and the new task/filter requirements.

## Needs Clarification

- None. The context-surface placement question was resolved by the operator on 2026-07-13: repository and worktree searchable comboboxes sit at the top of the sidebar above the Workspace section, with detailed provenance available from that surface.

## Hypotheses and Unknowns

- A small versioned registry plus live Git discovery is sufficient; no filesystem-wide scan is needed.
- Full teardown-and-reinit of root-scoped server state on switch is simpler and safer than parameterizing every subsystem, and satisfies the isolation requirements.
- Some coordination artifacts may not yet use a single path resolver, so migration inventory must precede file moves.

## Touchpoints to Exercise

- `src/cli/` command dispatch, viewer launch, Git/runtime helpers, and tests.
- `.agents/scripts/` coordination, worktree, validation, and status paths.
- `.agents/schemas/artifacts/` as the only artifact option source.
- `.delano/viewer/server.js`, viewer domain/index state, navigation, topbar/sidebar context, DataTable, workspace tables, and live events.
- Compiled viewer assets, package payload, CLI/user/viewer documentation, and install manifest drift checks.

## Probe Findings

- No probe was required. Repository inspection confirmed the viewer is single-root, the current “Open work” dataset is `tasks` minus done-toned rows, and the shared DataTable renders only a free-text input.
- `task.schema.json` already defines the canonical task status enum: `planned`, `ready`, `in-progress`, `blocked`, `done`, and `deferred`.

## Footguns Discovered

- The source draft's blanket statement that the viewer is read-only is stale: the current viewer supports guarded canonical apply, annotations, and handovers. This project preserves those capabilities only for the primary worktree and prevents switching from broadening write scope.
- A selected worktree path cannot be trusted merely because it came from the browser; every request must resolve selection against the server-side registry and fresh Git worktree inventory.
- Display labels such as “In progress” cannot be used as filter values because artifact contracts store canonical raw values such as `in-progress`.

## Remaining Unknowns

- The exact recognized legacy coordination file set must be confirmed from all coordination scripts before migration logic is implemented.
- Performance thresholds for repositories with many worktrees and large `.project/` trees should be measured in integration tests and optimized only if needed.

## Dependencies

- Git commands: `rev-parse --git-common-dir`, `worktree list --porcelain`, `diff`, and dirty-state inspection.
- Existing viewer index, containment guards, event/watch lifecycle, and guarded write endpoints.
- Existing JSON schemas under `.agents/schemas/artifacts/`; these remain the sole lifecycle/option authority.
- Existing packaging flow: viewer build, asset payload build, package manifest drift check, and npm tests.

## Approval Notes

- Approved for planning and breakdown by the operator request on 2026-07-13.
- Condensed on 2026-07-13 by operator request: same outcome and acceptance scenarios, downgraded from multi-stream to feature mode, one delivery stream, six sequential tasks instead of ten, schema options carried on the existing index payload, and full-reset context switching instead of per-subsystem parameterization.
- UI refinement approved 2026-07-13 from sidebar review: switchers become top-of-sidebar searchable comboboxes (FR-016), and the per-update Progress list collapses into one Progress entry (FR-017, AC-009).
