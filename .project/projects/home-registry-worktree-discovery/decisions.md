---
name: Repository and Worktree-aware Viewer
slug: home-registry-worktree-discovery
owner: bart
created: 2026-07-13T10:37:40Z
updated: 2026-07-13T11:13:31Z
---

# Decisions: Repository and Worktree-aware Viewer

## Active Decisions

- D-001: The home registry is disposable discovery metadata; durable delivery truth remains in each selected worktree's `.project/` tree.
- D-002: Git is the authority for repository identity and live worktree membership. The viewer never accepts an arbitrary client-supplied filesystem root.
- D-003: The viewer always identifies the selected repository, worktree, `.project/` data source, and divergence state in persistent UI context.
- D-004: Existing guarded viewer writes remain available only in primary-worktree context. Linked worktrees are inspect-only.
- D-005: Runtime coordination state belongs under the Git common directory so every worktree observes one shared state.
- D-006: “Open work” is replaced by a complete Tasks overview; status selection determines which task states are visible.
- D-007: Artifact schema enums are the only source for selectable table options. UI labels may format raw values but must not duplicate their vocabulary.
- D-008: The project runs in feature mode as one sequential stream. The original multi-stream contract added coordination ceremony without real parallelism: the dependency graph was nearly linear with one owner.
- D-009: A viewer context switch is a full teardown and reinitialize of root-scoped server state behind a generation token, not per-subsystem parameterization. Requests during a switch receive an explicit retry response.
- D-010: Schema enum options ride the existing viewer context/index payload; no dedicated endpoint or separate caching layer is built.
- D-011: The repository and worktree switchers live at the top of the sidebar, above the Workspace section, as searchable comboboxes following the shadcn/Radix combobox pattern and matching the selected-project dropdown's visual language.
- D-012: The sidebar lists one Progress entry, presented like Decisions, instead of one item per progress update file; the progress view exposes every update.

## Superseded Decisions

- None. D-008 through D-010 narrow the delivery approach; no prior decision is reversed.

## Open Decision Questions

- None. The provenance-surface placement question was resolved by D-011 on 2026-07-13; full divergence/path details remain one action away from the sidebar switchers.
