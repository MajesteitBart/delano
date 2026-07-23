---
name: Viewer Navigation and Research
slug: 018-viewer-navigation-research
owner: bart
status: complete
created: 2026-07-13T17:54:46Z
updated: 2026-07-13T18:27:26Z
outcome: The viewer exposes every selected project's research documents, preserves the nearest valid navigation intent across project and worktree changes, and presents the six requested Workspace entries with open-item counts.
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: Existing index roles, route normalization, project outlines, and sidebar count models provide direct extension points; fixture-led tests and browser verification are sufficient.
operating_mode: feature
---

# Spec: Viewer Navigation and Research

## Executive Summary

Refine the Delano Viewer information architecture in three connected ways: classify and expose project research files, preserve the user's semantic location when the selected project or worktree changes, and reduce Workspace navigation to Projects, Tasks, Context pack, Annotations, Warnings, and Blockers in that order.

## Problem and Users

Research intake is canonical project material under `projects/<slug>/research/**`, but the viewer currently classifies those files as generic context or progress and gives them no selected-project navigation surface. Project selection always forces Project overview, and a worktree generation change resets navigation rather than translating it to the closest valid route. The Workspace list also mixes project-specific evidence and diagnostic inventory with the user's primary navigation, and its Tasks and Annotations badges show totals instead of actionable open counts.

The affected users are maintainers and operators reviewing delivery contracts across projects and linked worktrees.

## Outcome and Success Metrics

- Every Markdown file below a selected project's `research/` subtree is indexed with the `research` role and appears in one project-level Research view.
- Project selection preserves a workspace view, an equivalent project section, or a matching source-document role; it falls back to overview only when no closer valid destination exists.
- Worktree/repository switching preserves the exact route when available and otherwise translates it to the closest valid workspace view, project section, or document role in the new index.
- Workspace navigation renders exactly Projects, Tasks, Context pack, Annotations, Warnings, and Blockers in that order.
- The Tasks badge counts canonical open statuses (`planned`, `ready`, `in-progress`, and `blocked`) while the Tasks table continues to include every canonical status.
- The Annotations badge uses the server-provided open count; deleted, resolved, done, and closed annotations do not contribute.
- Progress remains available within the selected project, while Workspace Progress and Validation are removed from primary navigation.

## User Stories

- US-001: As an operator, I want project research to be visible beside its source contracts, so I can inspect evidence without browsing the filesystem.
- US-002: As an operator comparing projects or worktrees, I want the viewer to preserve what I was doing, so context changes do not repeatedly send me to overview.
- US-003: As a maintainer, I want Workspace navigation to show only primary cross-project actions with actionable counts, so the sidebar is easier to scan.

## Acceptance Scenarios

- AC-001: Given nested Markdown files under `projects/<slug>/research/`, when the viewer index loads, then every file has role `research`, the project outline includes it, and one Research entry opens a table containing all of them.
- AC-002: Given the current route is a Workspace view, when another project is selected, then the Workspace view stays active while the selected-project context changes.
- AC-003: Given the current route is a project section or source document, when another project is selected, then the equivalent section or matching document role opens when available; task and workstream documents fall back to their collection views.
- AC-004: Given a repository/worktree switch, when the new index contains the same route or semantic equivalent, then that destination remains active; only unavailable destinations fall back to the nearest project section or Projects.
- AC-005: Given the sidebar renders, then Workspace contains exactly Projects, Tasks, Context pack, Annotations, Warnings, and Blockers in that order, with no Workspace Progress or Validation entries.
- AC-006: Given done, deferred, open, and blocked tasks, then the Tasks badge counts only planned, ready, in-progress, and blocked tasks while the Tasks page still lists all statuses.
- AC-007: Given open, resolved, closed, done, and deleted annotations, then the Annotations badge equals the index `annotationSummary.open` value.

## Scope

### In Scope

- Server-side research role classification and project-outline metadata.
- A selected-project Research list using the existing document table pattern.
- A project-specific Progress route using the existing single-entry sidebar pattern.
- Semantic navigation translation for project and repository/worktree changes, including stored-navigation migration.
- Workspace ordering, visibility, icons, and actionable badge counts.
- Focused server/domain/component tests, built viewer artifacts, package payload, documentation, and browser evidence.

### Out of Scope

- Editing research files or changing the `delano research` command.
- A cross-repository combined research view.
- Deleting progress or validation data from the index.
- Changing the all-status Tasks table dataset or canonical status vocabulary.
- Changing annotation lifecycle semantics or adding annotation mutations.
- Publishing a package or creating remote tracker records.

## Functional Requirements

- FR-001: `artifactRoleFor` recognizes `projects/<slug>/research/**/*.md` before filename-based progress classification so nested `progress.md` remains research evidence.
- FR-002: Project outlines expose sorted `research` paths in addition to existing source, task, workstream, and progress paths.
- FR-003: The selected-project sidebar presents one Research entry with its file count and one Progress entry with its update count; each opens a project-filtered document table.
- FR-004: Workspace navigation is sourced from one ordered definition containing only the six requested entries.
- FR-005: Workspace Tasks continues to render every indexed task, but its badge counts only planned, ready, in-progress, and blocked task contracts.
- FR-006: Workspace Annotations uses `annotationSummary.open`; the Annotations table may continue to expose non-deleted historical annotations.
- FR-007: Project switching does not change Workspace routes. Project-level routes retain their route kind, while document routes translate by exact path, source role, or nearest collection route.
- FR-008: Context generation changes translate the current route against the new index before falling back. Stored routes removed from Workspace navigation migrate to Projects, except project Progress remains a project-specific route when its project is available.
- FR-009: Route translation is deterministic and pure enough for domain fixtures covering exact, equivalent, and unavailable destinations.

## Non-Functional Requirements

- Navigation must not retain a document path outside the active index.
- Switching must not weaken existing generation isolation or linked-worktree write guards.
- Research order is deterministic by repository-relative path.
- Sidebar keyboard access, mobile sheet behavior, and existing table accessibility remain intact.
- No duplicated role or status lists are introduced outside the canonical domain helpers.

## Assumptions

- “Research files” means Markdown files anywhere below a project's `research/` directory.
- “Open tasks” excludes both terminal statuses `done` and `deferred`.
- Workspace Progress and Validation are removed from navigation, not from the index or project data.
- When no semantic destination exists after a switch, Projects is the safest cross-project fallback; Project overview remains the fallback for an available selected project with no matching section.

## Needs Clarification

- None. The operator's requested ordering and count labels are treated as authoritative.

## Hypotheses and Unknowns

- Existing document tables can represent Research and project Progress without a new generic page system.
- Most worktree switches retain identical project slugs and relative paths; semantic translation covers divergence without leaking stale state.

## Touchpoints to Exercise

- `.delano/viewer/server.js` indexing and project outlines.
- Viewer route types, restoration, navigation hook, Sidebar, Workspace model, and Project pages.
- Existing linked-worktree context switching and local-storage navigation state.
- Server, domain, component, package, and responsive browser checks.

## Probe Findings

- No probe is required. Repository inspection confirms research files are already walked, but default to `context`, while a nested research `progress.md` currently becomes `progress`.
- `annotationSummary.open` already exists in the index and can drive the requested badge without a new endpoint.
- `selectProject` and context-generation initialization explicitly set `project-overview`, which explains the observed reset.

## Footguns Discovered

- Research classification must precede the generic `/progress.md` check or research progress logs will remain split into the wrong view.
- Removing Workspace Progress without adding a project-specific Progress route would leave the existing selected-project Progress entry pointing at an all-project view.
- Route preservation cannot trust an old path after a context switch; every retained destination must be validated against the new index.

## Remaining Unknowns

- None material. Browser verification will confirm mobile ordering and context-switch behavior against divergent linked-worktree data.

## Dependencies

- Existing Markdown walker and project outline builder.
- Existing route/storage migration and generation-token context model.
- Existing document table, project selector, and context switcher components.
- Existing task schema and annotation summary payload.

## Approval Notes

- 2026-07-13T17:56:20Z: Operator-approved interface refinement spec is ready for planning.

- Approved by the operator's 2026-07-13 interface-change request. The request explicitly defines the Workspace order and count meanings; the semantic-route assumptions above choose the smallest behavior that removes forced overview resets.
