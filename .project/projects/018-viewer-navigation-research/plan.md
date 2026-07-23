---
name: Viewer Navigation and Research
status: done
lead: bart
created: 2026-07-13T17:54:46Z
updated: 2026-07-13T18:27:26Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: active
operating_mode: feature
---

# Delivery Plan: Viewer Navigation and Research

## What Changed After Probe

No probe was required. Source inspection located the three failures directly: research subtrees lack a dedicated artifact role, `selectProject` and generation changes force the default route, and Workspace ordering/counts come from one domain definition plus the workspace model. The plan adds project-scoped Research and Progress routes so the requested Workspace reduction does not hide project evidence.

## Technical Context

The viewer server walks all Markdown below `.project/`, assigns artifact roles by path, and builds a project outline. The React app stores a selected project plus a discriminated route in local storage. Workspace navigation is rendered from `WORKSPACE_NAV`; selected-project source navigation is assembled in `Sidebar`; project list routes use `ProjectPages`; context switches increment a generation and replace the index. Existing generation isolation and linked-worktree write guards must remain unchanged.

## Architecture Decisions

- Classify `projects/<slug>/research/**/*.md` as `research` before all filename-based roles. This keeps findings, task plans, and research progress together as one evidence set.
- Extend project outlines with sorted `research` paths. No new endpoint or filesystem scan is needed because the Markdown walker already discovers the files.
- Add `project-research` and `project-progress` route kinds backed by the existing document-table pattern. Workspace Progress disappears; selected-project Progress remains semantically correct and filtered.
- Replace route reset with a pure semantic translator. It validates exact paths first, maps source roles when changing projects, maps task/workstream documents to their collection pages, retains valid workspace views, and falls back to Projects or Project overview only when necessary.
- Keep a versioned navigation migration. Removed Workspace Progress and Validation routes migrate deterministically rather than producing unreachable state.
- Define canonical open tasks in one helper as statuses other than `done` and `deferred`; reuse it in workspace badges and project metrics. The Tasks dataset remains all-status.
- Use `annotationSummary.open` directly for the badge; do not duplicate annotation lifecycle rules in the UI.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map

- `spec.md`: Created from `.project/templates` by `delano project create`.
- `plan.md`: Single-stream implementation plan for index, route, sidebar, and verification changes.
- `workstreams/WS-A-viewer-navigation-refinement.md`: Owns the tightly coupled viewer surface and evidence.
- `tasks/`: Atomic implementation and verification tasks created after planning.

## Complexity Exceptions

- None recorded.

## Probe-Driven Architecture Changes

- None; the probe was explicitly skipped because existing fixtures and direct extension points bound the work.

## Workstream Design

- `WS-A Viewer Navigation Refinement`: one sequential stream owns server role/index changes, route translation, sidebar/page composition, tests, generated viewer/package assets, and closeout. Splitting server and UI work would create an invalid intermediate outline/route contract for one owner.

## Milestone Strategy

1. Index and expose research plus project-scoped Research/Progress routes.
2. Add semantic project/context route translation with storage migration.
3. Apply the requested Workspace ordering/count semantics and remove obsolete primary routes.
4. Run focused and release gates, browser-smoke the linked worktree, and close the contract.

## Rollout Strategy

- Land additive server metadata first so older UI behavior remains valid during implementation.
- Add route translation and project pages before removing Workspace entries, ensuring Progress remains reachable.
- Rebuild compiled viewer and package assets only after source and fixture checks pass.
- Commit or publish only when separately requested.

## Test Strategy

- Server fixture: nested research `findings.md`, `task_plan.md`, and `progress.md` all receive role `research` and appear sorted in the project outline.
- Domain fixtures: requested Workspace order, open task/annotation counts, exact-path preservation, equivalent project route mapping, task/workstream collection fallback, removed-route migration, and missing-project fallback.
- Component/source fixtures: selected-project Research and Progress entries, absence of Workspace Progress/Validation, and route wiring.
- Build/type-check, focused UI domain checks, viewer server tests, full `npm test`, payload rebuild/drift, contract/release validation.
- Browser smoke at desktop and mobile: exact Workspace order/counts, research visibility, project-switch intent, linked-worktree intent, no overflow, and zero console errors.

## Rollback Strategy

- Research metadata is additive and can be ignored by an older UI.
- Route translator and project pages are isolated domain/component changes; restoring the prior default-route behavior does not change indexed data.
- Workspace entries can be restored from the single ordered definition without changing server contracts.
- Generated assets are rebuilt only from validated source, so rollback is a source revert plus payload rebuild.

## Remaining Delivery Risks

- A stale document route could leak across contexts if translation skips new-index validation; exact membership checks are mandatory.
- Nested research `progress.md` can be misclassified if research precedence is wrong.
- Deferred task counts can regress if UI code relies on the broad visual `statusTone`; the open-task helper must encode lifecycle semantics explicitly.
- Existing stored Workspace Progress/Validation routes need a deterministic migration to prevent blank views.
