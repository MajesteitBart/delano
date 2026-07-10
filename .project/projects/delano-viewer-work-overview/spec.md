---
name: Delano Viewer Work Overview
slug: delano-viewer-work-overview
owner: Bart
status: active
created: 2026-07-10T07:48:58Z
updated: 2026-07-10T08:01:05Z
outcome: Operators can find actual recent file changes, review completed work, and choose dependency-safe upcoming work from the viewer, with every tabular work surface searchable, filterable, and sortable.
uncertainty: medium
probe_required: false
probe_status: skipped
probe_decision_rationale: The data contracts are inspectable in-repo; image mockups and Fable review provide the requested pre-implementation design gate.
operating_mode: feature
---

# Spec: Delano Viewer Work Overview

## Executive Summary

Make the Delano viewer the useful first stop for delivery supervision. The viewer opens on a Home page that summarizes work happening now, work recently completed, and the best next work. A Review page assembles recently completed tasks, evidence health, and actual files changed so delivered work can be checked. A Plan page makes the canonical queue legible as Should, Can, Could, and Waiting without inventing new Delano states. An Updated Files page reports real Git working-tree and commit activity rather than misleading checkout mtimes. Every current and new table receives consistent search, filters, sorting, result counts, reset behavior, and pagination after querying.

## Problem and Users

Delano operators and agent supervisors can inspect individual projects and documents, but the current viewer does not answer four common portfolio questions quickly: what is happening now, what actually changed, what just finished and needs review, and what should happen next. Existing tables paginate but cannot be searched, filtered, or sorted by the operator. The current `updated` fallback also uses filesystem mtime for documents without canonical frontmatter; a fresh checkout can therefore make historical files appear newly updated.

## Outcome and Success Metrics

- SM-1: Every workspace and project table exposes keyboard-accessible search, relevant field filters, sortable columns with visible direction, a result count, reset, and a useful zero-result state; filtering and sorting happen before pagination, and query changes reset to page 1.
- SM-2: The viewer opens on Home and presents Current, Recently completed, and Up next sections from the live index and file-activity data without requiring a project selection.
- SM-3: Updated Files distinguishes uncommitted working-tree changes from committed history, shows repo-relative path, change kind, provenance, commit/working timestamp, and optional project/document context, and never labels checkout mtime as committed recency.
- SM-4: Review shows recently done tasks with acceptance/evidence completeness plus the files/commits available to inspect, and exposes the existing review handover action without adding a review lifecycle status.
- SM-5: Plan categories pass fixture-backed rules: Should = in-progress work plus the top dependency-safe ready recommendations; Can = remaining dependency-safe ready tasks; Could = planned tasks whose dependencies are satisfied; Waiting = blocked tasks or tasks with unmet dependencies. A task appears in only one category.
- SM-6: Six separate horizontal viewer-native mockups are generated and each receives a Fable score of at least 9/10 before user feedback is requested; no implementation task is opened before user approval is recorded.
- SM-7: Viewer server tests, UI domain checks, typecheck/build, `npm test`, package asset rebuild/drift checks, Delano validation, and delegated browser smoke all pass or have explicitly recorded environmental exceptions.

## User Stories

- US-001: As a Delano operator, I want Home to summarize current, recent, and upcoming work, so that I can orient myself in seconds.
- US-002: As a reviewer, I want a queue of recently completed tasks, their evidence health, and the actual files changed, so that I can check delivery rather than infer it from status badges.
- US-003: As a planner, I want upcoming work grouped into Should, Can, Could, and Waiting using canonical dependencies and lifecycle state, so that I can make the next decision without breaking Delano semantics.
- US-004: As a maintainer, I want actual Git-backed file activity, so that checkouts and copied mtimes do not masquerade as recent work.
- US-005: As a power user, I want all tables to search, filter, and sort predictably, so that large portfolios remain navigable.
- US-006: As a maintainer, I want these views to feel native to the current viewer and remain responsive, accessible, testable, and package-safe.

## Acceptance Scenarios

- AC-001: Given the viewer starts with no saved route, when the index loads, then Home is selected and shows Current, Recently completed, and Up next using repository-wide data.
- AC-002: Given a table with more rows than one page, when the operator searches, filters, or sorts, then the entire dataset is queried before pagination, the page returns to 1, the active criteria are visible, and Reset restores the documented default ordering.
- AC-003: Given a file modified but not committed, when Updated Files loads, then the row is labeled Working tree with its Git change kind and repo-relative path; given a committed file, then its most recent commit timestamp/hash/subject are shown; filesystem mtime is not presented as commit history.
- AC-004: Given a recently done task, when Review loads, then the task shows checked/total acceptance criteria, evidence presence, project/workstream context, completed time, and a Request review handover action; the viewer does not write a new task status.
- AC-005: Given ready, planned, in-progress, blocked, and dependency-constrained task fixtures, when Plan is derived, then every task appears in exactly one correct category and ordering is deterministic by active state, priority, dependency safety, and stable identifiers.
- AC-006: Given any current workspace or project table, when the operator uses only the keyboard, then search, filters, sortable headers, clear/reset, pagination, and row opening have visible focus and accessible names.
- AC-007: Given Git is unavailable or the directory is not a Git worktree, when file activity is requested, then the viewer remains usable and shows a bounded explanatory empty/error state rather than failing the index or other pages.
- AC-008: Given the planned six-screen mockup set, when Fable reviews each current image, then every screen has an explicit score of at least 9/10 and the iteration record identifies the final artifact before user feedback is requested.
- AC-009: Given implementation is complete, when all quality commands and delegated browser flows run, then Home, Review, Plan, Updated Files, filtered table behavior, navigation persistence, responsive layout, and current reader/editing flows pass without regression.

## Scope

### In Scope

- Home as the default workspace route with Current, Recently completed, and Up next sections.
- Review page for recent done tasks, task evidence/acceptance summaries, recent commit/file context, and existing review handovers.
- Plan page with mutually exclusive derived Should, Can, Could, and Waiting categories.
- Updated Files page backed by bounded read-only Git working-tree and recent-commit inspection across the repository.
- File activity inspector/drawer for commit metadata, path context, and safe IDE/folder actions; `.project` markdown rows can open in the existing reader.
- A shared client-side table query model and reusable controls applied to every current workspace/project table and the new views.
- Six viewer-native image mockups, Fable iteration to at least 9/10 per design, and an explicit user approval gate.
- Responsive, keyboard, empty/error/loading, test, packaging, and documentation work for the changed surface.

### Out of Scope

- Inventing new Delano task statuses or changing lifecycle validators for review/Should/Can/Could.
- Persisting a new human-review attestation field in task frontmatter in the first delivery.
- Mutating Git state, staging, committing, reverting, or browsing remote PR diffs from the viewer.
- Editing arbitrary non-`.project` files inside the viewer; non-contract files open in the IDE or system folder.
- Full semantic mapping from every commit/file to a task when no commit, PR, or contract reference exists; the UI must label inferred adjacency conservatively.
- External Linear/GitHub writes, production deployment, or a hosted multi-user viewer.
- Replacing the existing reader, editor, annotation, handover, or activity-feed architecture.

## Functional Requirements

- FR-1: Add workspace routes and sidebar entries for Home, Review, Plan, and Updated Files; Home becomes the default route while project selection and current routes remain functional.
- FR-2: Add a bounded read-only `/api/work-overview` endpoint (or equivalent index extension) that returns working-tree file changes, recent commits/files, Git availability, and generated timestamp without exposing absolute paths or command output.
- FR-3: Parse Git data with argument arrays and stable machine-readable delimiters; cap commit count/time range and response size; handle rename, add, modify, delete, copy, untracked, staged, and unstaged states.
- FR-4: Join file activity to indexed `.project` documents/projects when exact repo-relative paths match. Unmatched files remain valid repository files and expose safe open actions only.
- FR-5: Add a pure work-overview domain model for current/recent/upcoming task derivation, review evidence summaries, deterministic priority ranking, dependency checks, and file-activity joins.
- FR-6: Implement reusable `TableToolbar`, field-filter, result-summary, and sortable-header primitives plus a pure table-query utility/hook. Each table declares searchable fields, filter definitions, sort comparators, and default sort.
- FR-7: Search is case-insensitive over meaningful visible values and paths. Filters are table-specific and may include project, status, role, workstream, priority, change kind, source, and time range. Multiple different filters combine with AND; multi-select values within one filter combine with OR.
- FR-8: Sorting is stable, handles missing values last, exposes ascending/descending state, and uses deterministic path/id tie-breakers. Dates sort chronologically and identifiers use natural ordering.
- FR-9: Home prioritizes one calm Now surface, a compact Recent delivery review queue, and a concise Up next list; it avoids duplicating every portfolio table.
- FR-10: Review defaults to recently done tasks and recent committed file activity, shows evidence/acceptance health, and reuses `HandoverMenu` review intent. It must not imply an unproven task-to-commit association.
- FR-11: Plan computes mutually exclusive categories: Should includes all in-progress items and up to three top ranked dependency-safe ready tasks; Can contains other dependency-safe ready tasks; Could contains dependency-satisfied planned tasks; Waiting contains blocked or unmet-dependency planned/ready tasks. Deferred and done tasks are excluded.
- FR-12: Updated Files defaults to newest actual activity, supports working-tree/recent toggles or source filters, groups or inspects commit context, and provides a distinct provenance badge for every timestamp.
- FR-13: Query state is shareable/restorable through route search parameters where practical; invalid values fall back safely, and switching tables/routes does not leak incompatible filters.

## Non-Functional Requirements

- NFR-1: No new server runtime dependency; Git inspection uses Node built-ins and existing safe process-spawn patterns.
- NFR-2: All Git commands are read-only, bounded, executed without a shell, scoped to the repo root, and fail closed without leaking absolute paths.
- NFR-3: The existing `/api/index`, document reader/editor, annotations, SSE watcher, activity feed, and handover contracts remain backward compatible.
- NFR-4: Pure derivation/query functions have fixture-backed tests covering empty values, natural identifiers, dependency edges, stable sorting, multi-filter combinations, and pagination reset.
- NFR-5: Large repositories remain responsive through bounded history, memoized client derivation, and no whole-repository filesystem watcher.
- NFR-6: New UI uses the current warm neutral shadcn/Tailwind token system, Inter/JetBrains Mono, compact hairline architecture, and existing focus/color semantics; no gradients, heavy shadows, or dashboard-card spam.
- NFR-7: Desktop, compact sidebar, tablet, and mobile layouts remain usable; dense tables may scroll horizontally only inside their own surface and preserve primary controls.
- NFR-8: Generated design assets and critique records live under repo-relative `output/design/delano-viewer-work-overview/` and contain no private absolute paths or unsafe raw prompts.

## Assumptions

- Git is available in normal Delano development repositories; a non-Git fallback is still required.
- Local commit history is sufficient for actual recent file activity; remote-only commits are out of scope.
- Canonical task dependencies use local task IDs within a project, as enforced by Delano.
- Existing checked Acceptance Criteria, Definition of Done, evidence logs, annotations, and review handovers provide enough review context for the first version.
- Search/filter/sort can be client-side because the viewer index and bounded activity payload are local and moderate in size.

## Needs Clarification

- No blocking discovery questions. User preference on the final visual composition is intentionally deferred to the six-screen mockup feedback gate.

## Hypotheses and Unknowns

- H-1: Bounded Git status/log calls are fast enough for an on-demand local endpoint in repositories of Delano's expected size; mitigate with response caps and refresh-on-demand if profiling disproves it.
- H-2: Operators understand Should/Can/Could when definitions are visible in tooltips and empty states; mockups and Fable review must test label clarity.
- H-3: Review is useful without a new persisted attestation; if operators need durable human signoff later, add it through a separate contract proposal rather than silently extending task frontmatter.
- H-4: One shared table-query model can cover all current tables without over-generalizing rendering; keep cell rendering table-owned and share only query/control behavior.

## Touchpoints to Exercise

- `.delano/viewer/server.js` and `test/viewer-server.test.js` for Git-backed activity data and safety/error coverage.
- `.delano/viewer/ui/src/lib/domain/{types,navigation,workspace-model}.ts` plus new pure query/work-overview modules.
- `.delano/viewer/ui/src/pages/{WorkspacePage,ProjectPages}.tsx` plus Home, Review, Plan, and Updated Files surfaces.
- `.delano/viewer/ui/src/components/organisms/{Sidebar,AppShell}.tsx`, shared table controls, and existing `HandoverMenu`/`Topbar` integrations.
- `.delano/viewer/ui/src/index.css`, UI domain checks, typecheck/build, built public assets, and npm payload manifest.
- Current reader, edit/save, live refresh, annotations, review handover, compact navigation, and pagination flows as regression routes.

## Probe Findings

- No technical prototype probe is required: server/client contracts, Git CLI behavior, and Delano lifecycle semantics are inspectable and use established repository patterns.
- Research found a concrete recency footgun: documents without canonical frontmatter can inherit checkout mtimes, so actual file activity must use Git provenance.
- The requested six mockups plus iterative Fable critique are a design approval gate, not a substitute for canonical discovery or an implementation probe.

## Footguns Discovered

- Working-tree timestamps and commit timestamps are different provenance; the UI must never collapse them into one unlabeled “updated” value.
- Git rename/copy status is two-path data; naive line parsing loses the source path.
- `ready` with unmet dependencies can exist in imported legacy graphs; Plan must re-check dependencies instead of trusting status alone.
- Search/filter/sort must run before pagination or rows on other pages disappear incorrectly.
- Review is not a canonical task status. Adding one only in the UI would create contract drift.
- `.delano/viewer/public` and `assets/payload` are generated surfaces; source changes require the correct build sequence and drift checks.

## Remaining Unknowns

- Exact default recent windows and per-section row counts are design-level choices to validate in mockups; implementation defaults remain configurable constants rather than persisted user settings.
- A durable human-review attestation may be valuable later but is explicitly outside this delivery.

## Dependencies

- Local Git CLI for actual file history when available.
- Existing React 19, shadcn/Radix, Tailwind v4, Lucide, and viewer server built-ins.
- Existing Delano task lifecycle, `depends_on`, priority, evidence, annotations, and handover contracts.
- OpenAI image generation through the required `imagegen-frontend-app` workflow and local Claude CLI access to Fable for the design gate.

## Approval Notes

- 2026-07-10: User requested the complete feature set, the Delano workflow, six viewer-native mockups after planning, iterative Fable review until every design scores at least 9/10, and a pause for user feedback before implementation. This is treated as approval to complete discovery, planning, breakdown, and the design gate only.
