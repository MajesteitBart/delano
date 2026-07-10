---
name: Delano Viewer Work Overview
status: active
lead: Bart
created: 2026-07-10T07:48:58Z
updated: 2026-07-10T10:02:02Z
linear_project_id: 
risk_level: medium
spec_status_at_plan_time: planned
operating_mode: feature
---

# Delivery Plan: Delano Viewer Work Overview

## What Changed After Probe

- No technical probe was required. Repo-native research replaced the ambiguous “updated” concept with an explicit data contract: actual committed activity comes from Git history, uncommitted activity comes from Git working-tree state, and canonical contract `updated` remains a separate field.
- Review and Plan remain derived views over existing lifecycle/evidence contracts. No validator or frontmatter status expansion is planned.
- A six-screen image/Fable/user approval gate was added ahead of every implementation task at the user's request.

## Technical Context

- Server: `.delano/viewer/server.js`, plain Node HTTP and built-ins. The index currently walks `.project` markdown and exposes frontmatter plus task dependency metadata. Existing safe process-spawn helpers provide precedent for a bounded read-only Git adapter.
- UI: `.delano/viewer/ui`, React 19 + Vite + Tailwind v4 + shadcn/Radix. Workspace/project tables are currently local components with pagination only. The shell uses a 264px contextual sidebar, sticky topbar, warm neutral tokens, Inter, and JetBrains Mono.
- Generated delivery: UI build writes `.delano/viewer/public`; `npm run build:assets` mirrors package payload; package-manifest checks must follow source/build changes.
- Workflow: task lifecycle and dependency semantics remain sourced from `.project`; `ready` alone is insufficient when dependencies are unmet.

## Architecture Decisions

- AD-1 **File activity adapter**: add a request-driven, read-only Git adapter in the viewer server. Use `spawnSync`/argument arrays without a shell; parse NUL-delimited status/log records; cap commit history, files, stdout bytes, and command time. Return repo-relative data only.
- AD-2 **Provenance split**: model `contractUpdatedAt`, working-tree observation time, and commit author time separately. Updated Files always labels `working-tree` or `commit`; it never substitutes filesystem mtime for commit history.
- AD-3 **Domain derivation**: keep file/task/review/look-ahead derivation in pure client modules with exported fixtures/tests. Extend `DocMeta` typing for existing `dependsOn`, priority, estimate, and selected evidence summary fields rather than changing canonical task files.
- AD-4 **Table architecture**: share query state, normalization, stable comparison, field filters, toolbar, result summary, and sortable headers. Tables retain their own column/cell renderers. Query/filter/sort executes before `paginateItems`.
- AD-5 **Routes**: add Home, Review, Plan, and Updated Files workspace routes. Home becomes the default; project overview and current workspace routes remain deep-linkable. Search params carry compatible table query state.
- AD-6 **Review semantics**: derive acceptance/evidence health from task markdown metadata/body summary supplied by the server or a bounded parser, and reuse `HandoverMenu` with `intent: review`. No review status is persisted.
- AD-7 **Plan semantics**: categories are mutually exclusive. Should contains in-progress tasks plus up to three ranked safe-ready recommendations; Can contains other safe-ready tasks; Could contains dependency-satisfied planned tasks; Waiting contains blocked/unmet tasks. Deferred/done are excluded.
- AD-8 **Design system**: Working Chrome; quiet premium-neutral light theme; hairline architecture; Geist/Inter-like product sans with JetBrains Mono data accents; slim contextual sidebar; table-led system. Signature components: precision data table, filter/segment bar, timeline/activity feed, inspector side panel. Motion language: row-hover reveal and panel slide-in. Character spine: precision instrument. One second-read moment: a narrow tick-marked review rail on Home only.
- AD-8A **Current chrome lock**: The user's later six 1920×1080 screenshots supersede the initial art-direction freedom. Reproduce the existing 263px visible sidebar, lowercase leaf-logo lockup, exact navigation/count/selected-row anatomy, 56px top bar, Last updated/Activity/Open actions, 1120px centered page column, table surfaces, and right drawers. Remove the earlier tick-mark rail and any generated shell inventions.
- AD-8B **Persistent viewer identity**: The top bar's left side identifies the running viewer instance on every route rather than repeating the active page or document title. Render a quiet, truncation-safe `worktree · repository` label from a server-supplied `viewerIdentity` contract; keep route/document titles and statuses in the page or document header. Mirror the same identity in the browser-tab title, provide the complete value through an accessible tooltip, and never expose an absolute path. The server owns override and fallback derivation so the React shell does not guess identity from route state or URLs.
- AD-9 **Design gate**: generate exactly six separate horizontal images—Home, Review, Plan, Updated Files, filtered table state, file/detail inspector—under one locked system. Submit the actual images plus structured rubric to Fable via Claude CLI, iterate any screen below 9/10, record scores/artifacts, then pause for user feedback. All implementation tasks depend on this gate.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map

- `spec.md`: Scaffolded by `delano project create`; completed from repo-native research and user intent.
- `plan.md`: Architecture, derived workflow semantics, milestones, tests, rollout, rollback, and design gate captured here.
- `decisions.md`: Recency provenance, derived state, shared table model, Git boundary, and design-gate decisions.
- `workstreams/`: WS-A design approval; WS-B data/table foundation; WS-C workflow views; WS-D integration/quality.
- `tasks/`: Atomic T-001 through T-009 with binary acceptance and acyclic dependencies; implementation remains planned until T-001 user approval.
- `research/viewer-work-information-architecture/`: evidence that defines the file/review/look-ahead information model.
- `output/design/delano-viewer-work-overview/`: generated images and privacy-safe Fable review artifacts; no raw private prompts.

## Complexity Exceptions

- Git status/log parsing is isolated server-side because the viewer must show actual repository files, not only indexed contracts. It remains read-only, bounded, dependency-free, and covered by fixtures.
- Home intentionally composes small slices from multiple models; it must use shared selectors rather than duplicate task/file derivation.

## Probe-Driven Architecture Changes

- No prototype changes. Research did change the initial concept from an `updated`-sorted document page to a Git-provenance activity model because checkout mtime is not historical truth.

## Workstream Design

- **WS-A Design Approval**: T-001 creates six viewer-native mockups, loops with Fable to ≥9/10 per screen, records evidence, and pauses for user approval. Owns only `output/design/` and design notes; it gates all implementation.
- **WS-B Data and Table Foundation**: T-002 adds safe Git/evidence summary data and server tests; T-003 adds pure table/work-overview models and shared controls. Server/client ownership is split to minimize conflicts; both depend on T-001.
- **WS-C Workflow Views**: T-004 Home, T-005 Review, T-006 Plan, and T-007 Updated Files/inspector. Each owns a page/model slice; dependencies on T-002/T-003 are explicit.
- **WS-D Integration and Quality**: T-008 integrates routes/sidebar/topbar/responsive/accessibility across the shell after view tasks; T-009 runs unit/server/UI/package/Delano checks and Codex-delegated browser regression, then records evidence.
- Conflict zones: shared navigation/types/shell are owned by T-008; foundational domain types are owned by T-003; `server.js` is owned by T-002 until quality fixes in T-009.

## Fable Frontend Handoff

### Delivery boundary

- Codex remains coordinator and owns the Delano contracts, the bounded Git/activity and `viewerIdentity` server contracts, server tests, task evidence, source-build sequencing, and final quality gates.
- Fable owns the frontend source implementation after the user approves the direction: shared table controls and query UX in T-003; Home, Review, Plan, Updated Files, and the file inspector in T-004 through T-007; and shell/navigation/responsive integration in T-008.
- Fable may change `.delano/viewer/ui/src/**` only within the assigned task boundary. It must not edit `.delano/viewer/server.js`, canonical `.project` contracts, generated `.delano/viewer/public`, package payloads, or commit/push history.

### Reference packet

- Treat the user's unannotated Updated Files image as the accepted information-architecture direction and the annotated image as the global top-bar correction.
- Treat the six supplied 1920×1080 current-viewer screenshots, the current React/CSS source, `PRODUCT.md`, and `DESIGN.md` as implementation references. Where a documented shell measurement differs from the supplied screenshots and current source, preserve the supplied/current viewer geometry and record the documentation drift for closeout.
- Preserve the exact current logo, sidebar, top-bar height, action placement, content width, table language, borders, typography, drawers, and compact-navigation behavior. Fable is extending the viewer, not redesigning its shell.
- Codex supplies typed fixtures for `viewerIdentity`, file activity, review summaries, dependency-safe plan categories, table query state, loading, empty, unavailable, and error states before the corresponding frontend slice is accepted.

The frontend identity seam consumes this server-owned shape:

```ts
type ViewerIdentity = {
  worktree: string
  repository: string
  displayLabel: string // `${worktree} · ${repository}`
  branch?: string
}
```

The server resolves `repository` from an explicit viewer override or the Git remote basename, then falls back to the repository-root basename. It resolves `worktree` from an explicit viewer override, then a human-readable branch/worktree label, then a sanitized root basename. Generated prefixes may be shortened for display but remain available in the tooltip. Every fallback is a label only; no absolute path crosses the API boundary.

### Frontend sequence

1. **Identity seam**: add a reusable top-bar identity presentation consuming `viewerIdentity.displayLabel`; remove route-title derivation from the shell; keep page/document titles in content; move contextual status beside the appropriate page/document heading; update the browser-tab title.
2. **Table primitives**: implement the shared search, field-filter, sort, reset, result-count, pagination, empty-state, and keyboard/focus behavior without forcing all tables into one renderer.
3. **Reference surface first**: build Updated Files and its inspector against the accepted image. Use it to settle toolbar density, sortable headers, grouped provenance rows, paging, row hover/selection, and drawer anatomy.
4. **Workflow surfaces**: build Home, Review, and Plan from the approved selectors and fixtures. Keep Home concise; keep Review evidence-led; explain Should/Can/Could/Waiting as derived views rather than statuses.
5. **Legacy coverage**: apply the shared controls to every existing workspace/project table while preserving current cells, links, status treatments, and document navigation.
6. **Responsive and state polish**: verify truncation, tooltips, drawers, horizontal table containment, loading/empty/error states, reduced motion, focus order, and compact sidebar behavior.

### Fable acceptance checkpoints

- At 1920×1080 and 100% zoom, the Updated Files implementation matches the accepted composition and the existing shell closely enough that only feature content and the new viewer-identity label appear changed.
- Two viewers launched for different worktrees or repositories show distinct top-bar labels on every workspace, project, reader, editor, activity, and review-panel state. The label format remains `worktree · repository`; overflow truncates without hiding the complete accessible name.
- Browser tabs begin with the same viewer identity and append the current page/document context, for example `delano-viewer-work-overview · delano — Updated files`.
- Search, filters, sorting, reset, result totals, and pagination compose predictably; filters/search execute before pagination; sort direction is visible and announced; keyboard-only operation passes.
- Contextual project/document status remains visible near its page/document heading after it leaves the global top bar.
- Fable returns a task-scoped diff and a concise implementation note for each checkpoint. Codex runs tests, builds generated assets, delegates browser checks through `codex exec`, and records release evidence.

## Milestone Strategy

- M1 **Design approval**: T-001; six separate images, every Fable score ≥9/10, user feedback captured. No implementation starts before this gate closes.
- M2 **Truth and query foundation**: T-002-T-003; bounded Git activity/evidence data plus shared table/query selectors proven by tests.
- M3 **Workflow surfaces**: T-004-T-007; Home, Review, Plan, and Updated Files/inspector functional with shared controls.
- M4 **Product integration**: T-008; default route/navigation/search params/responsive/accessibility integrated without reader/editor regression.
- M5 **Release evidence**: T-009; tests/build/package/validation/browser evidence complete and project ready for closeout.

## Rollout Strategy

- Local feature branch only; no remote writes or production deploy in this plan.
- After user design approval, implement foundation first, then independent workflow pages, then shell integration.
- Rebuild `.delano/viewer/public` from UI source and package payload only after source tests pass. Keep commits reviewable by workstream/task.
- Home becomes the default route in the same delivery; existing routes remain accessible and saved valid routes continue to restore.
- Git-unavailable repositories degrade to contract-only Home/Review/Plan with an explanatory Updated Files state.

## Test Strategy

- Server unit/integration: Git status/log parser fixtures for M/A/D/R/C/untracked, staged+unstaged, spaces/unicode, empty repo, timeout/failure, caps, no absolute paths, and existing endpoint regression.
- Domain unit: normalized search, multi-filter AND/OR, missing-last stable sorts, natural task IDs, date sorts, query reset, dependency safety, mutual exclusivity, priority ranking, evidence summaries, and Git/document joins.
- UI checks: existing domain script, TypeScript, lint on changed files, production build, component interaction tests where present.
- Browser smoke delegated through `codex exec` per repo rule: Home orientation; Review handover; Plan categories; Updated Files filters/inspector; an existing table search/filter/sort/paginate flow; two concurrent viewer instances with distinct top-bar and browser-tab identities; compact sidebar/mobile identity truncation; reader/edit/save/live refresh regression. Store repo-relative screenshots/evidence.
- Package/repo: `npm test`, UI build, `npm run build:assets`, `npm run check:package-manifest`, `delano validate`, log/path safety relevant checks, and understood `git status`.

## Rollback Strategy

- Routes and pages are additive. Revert the feature commits or restore the previous default route to project overview if Home causes regression.
- The Git adapter is isolated behind one endpoint; failure or rollback leaves `/api/index`, reader/editor, annotations, SSE, and handovers unchanged.
- Shared table controls can be rolled back table-by-table because table cell renderers stay local.
- Generated design artifacts and project contracts have no runtime effect and can remain as historical evidence if implementation is deferred.

## Remaining Delivery Risks

- R-1: Git parsing edge cases or large history can delay requests. Mitigate with NUL delimiters, hard caps, timeout, fixtures, and graceful unavailable state.
- R-2: Home becomes noisy by composing too much data. Mitigate through the six-screen design gate, restrained row counts, and one dominant Now surface.
- R-3: Should/Can/Could may be read as new lifecycle states. Mitigate with visible definitions, semantic-neutral badges, and tests/documentation tying them to canonical statuses.
- R-4: A universal table abstraction can become rigid. Mitigate by sharing only query/control behavior and leaving rendering/composition with each table.
- R-5: Fable may score image aesthetics without verifying buildability. Mitigate with a rubric that separately scores viewer fidelity, workflow clarity, table interaction legibility, implementation specificity, accessibility, and data realism.
- R-6: Full `delano validate` exceeded the initial 120-second command window without output. Rerun after fold-forward with a longer non-blocking wait and capture scoped validation if the wrapper remains environmental.
- R-7: A worktree folder or branch name alone may be generated, ambiguous, or too long. Mitigate with a server-owned label override and deterministic fallback chain, a compact visible label, an accessible full tooltip, and the repository name as a second identity dimension.
