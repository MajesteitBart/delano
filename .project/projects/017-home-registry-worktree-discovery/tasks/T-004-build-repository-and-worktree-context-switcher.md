---
id: T-004
name: Build repository and worktree context switcher
status: done
workstream: WS-A
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T12:08:53Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: [.delano/viewer/ui/src/App.tsx, .delano/viewer/ui/src/app/**, .delano/viewer/ui/src/components/organisms/**, .delano/viewer/ui/src/lib/domain/**]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-005]
---

# Task: Build repository and worktree context switcher

## Description

Build the viewer repository/worktree selector and persistent provenance surface at the top of the sidebar, above the Workspace section. The repository switcher and the worktree switcher are searchable comboboxes (shadcn/Radix combobox pattern: popover plus filterable command list) styled like the existing selected-project dropdown. Repository identity, worktree identity, selected `.project/` source, divergence/dirty state, and linked-worktree read-only behavior must be understandable from every route.

## Acceptance Criteria
- [x] The sidebar renders the repository combobox and the worktree combobox above the Workspace section; both filter options as the user types, are keyboard-operable, and match the selected-project dropdown's visual language.
- [x] The shell always shows the selected repository and worktree role, with one-action access to full name/path, branch or detached state, HEAD, `.project/` source, availability, and divergence details.
- [x] Repository options are sorted predictably, worktree options identify primary/linked and status, and unavailable entries explain the failing local path without silently switching roots.
- [x] Switching clears or revalidates project/document/navigation/filter/annotation/activity state, shows loading/error state, and persists a versioned repository/worktree-aware selection safely across refresh.
- [x] Linked-worktree write actions are disabled with explanatory copy, while the primary-worktree editing/review experience remains available.
- [x] Component/domain tests cover labels, selection fallback, context reset, and dirty/diverged presentation at desktop and narrow widths.

## Traceability
- Story: US-002
- Acceptance criteria: AC-001 AC-002 AC-003 AC-005

## Technical Notes

- Prefer concise persistent identity plus progressive disclosure for long local paths and divergence details.
- Preserve existing visible-source-path design language and keyboard-accessible controls.
- Build the comboboxes from primitives already shipped in the viewer where possible (popover + command); add missing shadcn primitives rather than a new dependency. Reference: https://ui.shadcn.com/docs/components/radix/combobox.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T12:08:53Z: Searchable repository/worktree controls, persistent provenance/details, safe versioned restore/reset, and linked read-only UI implemented; typecheck, domain checks, 9 focused component checks, targeted lint, and production build passed.

- 2026-07-13T12:07:28Z: Implemented searchable repository/worktree comboboxes above Workspace, persistent topbar provenance and full context details, deterministic availability/status presentation, versioned safe restore, generation-scoped navigation/document/activity reset, and linked-worktree read-only controls. Evidence: UI typecheck passed; domain helper checks passed; 9 context/reader component checks passed; targeted ESLint passed; Vite production build passed (only existing chunk-size advisory).

- 2026-07-13T11:56:43Z: Building repository/worktree comboboxes, provenance surface, context reset, and linked read-only UI.

- 2026-07-13T11:56:43Z: T-003 dependency is done; context switcher UI scope readiness-reviewed and selected ahead of conflicting T-005 UI work.
- 2026-07-13T10:57:56Z: Created during plan condensation; carries forward the prior T-006 unchanged in scope.
- 2026-07-13T11:13:31Z: Operator sidebar review fixed placement (top of sidebar, above Workspace) and control type (searchable shadcn/Radix comboboxes for repository and worktree).
