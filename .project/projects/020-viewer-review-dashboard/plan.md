---
name: Viewer Review Mode and Project Dashboard
status: done
lead: bart
created: 2026-07-13T21:53:24Z
updated: 2026-07-13T22:28:06Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: active
operating_mode: feature
---

# Delivery Plan: Viewer Review Mode and Project Dashboard

## What Changed After Probe

No disposable prototype was required. Repository inspection and a T3 reproduction identified the exact review-state and layout faults, while index inspection established which dashboard signals are truthful. The plan therefore moves directly to isolated interaction, layout, domain-model, and composition tasks.

## Technical Context

- The viewer is a React/Vite client served by `.delano/viewer/server.js` and packaged into `.delano/viewer/public/assets/`.
- `DocumentReaderPage` owns reader mode, annotation API state, composer state, and the fixed `AnnotationDrawer`.
- `MarkdownArticle` owns rendered-mark lifecycle and selection capture through `web-highlighter`.
- `ProjectOverviewPage` receives the indexed project, documents, workstreams, and tasks; source documents include parsed snippets and timestamps.
- The index is a current snapshot. It does not retain historical task-state transitions, so the dashboard must visualize current state and recent timestamped evidence only.

## Architecture Decisions

### AD-001: Separate Review visibility from annotation creation permission

`MarkdownArticle` will receive explicit review visibility and creation capability rather than infer behavior from annotation data. Read mode installs no annotation selection path. Writable Review can compose; read-only Review can inspect existing marks.

Alternatives considered: keep the current callback and return early, which still lets the highlighter mutate or clear native selection; infer Review from annotation count, which violates explicit mode semantics. The explicit capability split prevents both failure modes.

### AD-002: Keep the drawer fixed and remove layout compensation

The existing fixed drawer remains the overlay surface. The reader wrapper will not add right padding when Review opens, so line length, article width, and reading position remain stable.

Alternatives considered: resize the document to reserve drawer space, which directly conflicts with the requested overlay behavior; convert to a centered modal, which harms continuous document review.

### AD-003: Build a current-state delivery dashboard from indexed contracts

The dashboard will derive a project summary, segmented task-state distribution, per-workstream completion, spec brief, and recent progress evidence from existing indexed documents. It will not create a new analytics API or infer historical trends.

Alternatives considered: retain the document table, which does not answer project-status questions; synthesize a Linear-style burndown, which would present snapshot data as history.

### AD-004: Keep dashboard derivation pure and independently testable

Task grouping, workstream summaries, project timestamps, and evidence ordering will live in a small domain helper. The page will compose those values using existing navigation callbacks and flat Local Dossier presentation primitives.

## Policy and Contract Checks
- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map
- `spec.md`: Created through `delano project create`, then completed from repository, T3, supplied-image, and official product-reference research.
- `plan.md`: Created through `delano project create`, then completed under `planning-skill`.
- `workstreams/`: `WS-A` created through the Delano CLI and bounded to viewer review/dashboard delivery.
- `tasks/`: Atomic dependency-safe tasks will be created through the Delano CLI under `breakdown-skill`.

## Complexity Exceptions
- None recorded.

## Probe-Driven Architecture Changes

- Dropped any historical line or cycle chart from the implementation because no historical task-state series exists.
- Replaced a single `reviewOpen` inference with explicit Review state plus a separate writable capability.
- Retained the fixed drawer implementation and scoped the geometry fix to its compensating page padding.

## Workstream Design

One workstream owns the cohesive viewer change. The reader work touches `DocumentReaderPage`, `MarkdownArticle`, and `AnnotationDrawer`; the dashboard work touches the project page, domain model, styling, and focused tests. Documentation, built assets, browser evidence, and lifecycle closure follow after both surfaces pass their focused gates.

## Milestone Strategy

1. **Review boundary:** explicit mode, annotation gating, and read-only behavior pass focused checks.
2. **Stable overlay:** live geometry confirms the drawer does not reflow the reader.
3. **Dashboard domain:** current-state model and edge cases pass deterministic tests.
4. **Dashboard composition:** project pages replace the inventory with responsive, source-linked sections.
5. **Release evidence:** viewer build, relevant tests, Delano validation, T3 smoke checks, docs, and generated assets are current.

## Rollout Strategy

- Land source changes behind the existing Review button and project route; no data migration or configuration flag is needed.
- Rebuild packaged viewer assets only after focused source checks pass.
- Exercise a writable project, a linked read-only worktree, an active project, and a completed project before closure.

## Test Strategy

- Add focused automated coverage for Review gating and dashboard derivation/source composition.
- Run targeted lint/type/build checks over changed viewer modules.
- Run `npm test`, `npm run build:viewer`, package-manifest checks where relevant, and `delano validate`.
- Use the T3 preview to verify read selection, Review composition, existing annotations, drawer geometry, dashboard drilldowns, and narrow viewport behavior.
- Record measurements and command results in task evidence and a project update.

## Rollback Strategy

- Revert the isolated Review capability props and reader wrapper change to restore prior behavior without touching annotation data.
- Revert `ProjectOverviewPage`, dashboard domain helper, and associated styles to restore the existing document table.
- Regenerate packaged viewer assets from the restored source. No schema or persisted-data rollback is required.

## Remaining Delivery Risks

- The shared worktree already contains adjacent uncommitted viewer changes; implementation must preserve and validate them without broad formatting or unrelated rewrites.
- A fixed drawer can obscure content at intermediate widths even without reflow; responsive checks must ensure it remains dismissible and legible.
- Status values beyond common canonical forms may appear in legacy contracts; task grouping needs an explicit fallback rather than silently dropping records.
