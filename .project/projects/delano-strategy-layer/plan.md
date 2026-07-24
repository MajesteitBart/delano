---
name: Delano Strategy Layer
status: active
lead: bart
created: 2026-07-23T22:59:54Z
updated: 2026-07-24T06:35:24Z
linear_project_id:
risk_level: high
spec_status_at_plan_time: planned
operating_mode: multi-stream
---

# Delivery Plan: Delano Strategy Layer

## What Changed After Probe

No prototype was run. The adversarial review replaced four unsafe or scope-expanding assumptions:

- reverse links are derived from project specs rather than written to roadmap items;
- promotion is a canonical domain action followed by an optional handover;
- receipts use indexed contract facts rather than Git commit counts or parsed closeout prose;
- v1 ships a horizon board only, with timeline, targets, sharing, and approval workflow excluded.

Repository inspection also changed the context plan: vision and mission must be optional profile members when present, not fixed profile/fallback entries that warn in non-adopting repositories.

## Technical Context

- Native lifecycle commands live in `src/cli/commands/state.js` and share parsing/writing helpers from `src/cli/lib/project-state.js`.
- Project creation is reusable but writes the dossier in place, so promotion needs explicit failure safety.
- Artifact types and status rules are spread across `.agents/schemas/`, root validators, `validate.sh`, tests, templates, package assets, and the generated `.claude/` mirror.
- The context reader has fixed profile arrays and fallback ordering. Optional direction files need presence-aware selection and focused regression tests.
- The viewer recursively indexes `.project` Markdown, but artifact roles, pinned tiers, workspace routes, domain types, and page composition are explicit.
- Canonical viewer body edits use hash, confirmation, capability, and audit guards. Frontmatter stays locked, so roadmap actions need a structured endpoint that delegates to the shared roadmap domain service.
- Live events already debounce filesystem notifications into `index-changed` and `doc-changed` events. The roadmap board must map linked-project changes back to affected cards.

## Architecture Decisions

### AD-001: Context prose is optional; roadmap items are contracts

Vision and mission are non-destructive context seeds delivered by the overview profile only when present. They have no lifecycle or minimum-length contract. Roadmap items alone receive IDs, schema, lifecycle, validation, and CLI mutation.

### AD-002: Project specs own the relationship

`spec.frontmatter.roadmap_item` is the single persisted relationship. A pure projection scans project specs to derive linked projects and receipts. Roadmap items never store a project list.

### AD-003: Promotion and handover remain separate

The shared roadmap service validates the source item and creates a planned project with the reference. The CLI and viewer call that service. Only after success may the viewer offer the existing `start` handover on the created spec.

### AD-004: Receipts are current, canonical facts

The projection reports linked project states, task-state totals, the newest canonical update time, and source links. It does not query Git, infer impact from commits, normalize heterogeneous closeout prose, or generate a completion percentage.

### AD-005: Lifecycle prevents status theater

`active` items must be in `now` and have an active linked project. `done` requires explicit closure evidence, at least one complete linked project, and all linked projects terminal. No project transition automatically changes the item.

### AD-006: Board first and only in v1

Open items render in `now | next | later`; terminal items render through an archive filter. Dates, targets, timelines, Gantt, dependencies, estimates, assignments, and velocity are excluded.

### AD-007: Structured viewer writes reuse domain rules

A roadmap action endpoint accepts whitelisted operations, validates worktree capability, compares `expectedHash`, requires confirmation, delegates to the shared roadmap service, and records an audit receipt. It does not unlock freeform frontmatter or duplicate lifecycle logic in React/server code.

### AD-008: Staleness is an advisory projection

The board derives explicit reasons using an injected clock and a 21-day default. Staleness never changes canonical status and never fails validation.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map

- `spec.md`: Rewritten from repository evidence and the adversarial review under `discovery-skill`.
- `plan.md`: Rewritten from the planned spec under `planning-skill`; remains planned pending owner confirmation.
- `workstreams/`: Four bounded workstreams created from `.project/templates/workstream.md`.
- `tasks/`: Atomic planned tasks created from `.project/templates/task.md` under `breakdown-skill`.
- `research/strategy-artifact-design/`: Prior findings retained as evidence and revised to record rejected assumptions.

## Complexity Exceptions

- The shared roadmap projection/service crosses CLI, validator, and viewer consumers. It is isolated as an explicit domain boundary so lifecycle and link rules are implemented once.
- Viewer source changes require generated public assets, package payload rebuilds, and GUI evidence; those outputs are deferred to the integration workstream after source gates pass.

## Probe-Driven Architecture Changes

- Removed physical back-link mutation and its implied multi-file transaction.
- Removed timeline/target fields and public sharing from this delivery.
- Recast promotion from a handover intent to a state mutation with optional follow-on dispatch.
- Replaced commit/closeout aggregation with a deterministic indexed receipt model.
- Added presence-aware context-profile work and promotion failure safety, both missed by the earlier proposal.

## Workstream Design

- **WS-A Contract and Projection Kernel:** own context opt-in behavior, roadmap schema/lifecycle, validation, and the pure reverse-link/receipt/staleness projection.
- **WS-B CLI and Promotion:** own the `delano roadmap` command family, shared mutations, failure-safe project promotion, and CLI tests.
- **WS-C Viewer Roadmap:** own roadmap indexing, board UI, structured server actions, optional post-promotion handover, SSE refresh, and viewer tests.
- **WS-D Integration and Release:** own docs/skill guidance, mirrors/assets/package coverage, cross-surface quality gates, browser evidence, and handoff.

WS-A establishes contracts before WS-B and WS-C mutations. WS-B and the read-only portion of WS-C can progress after the projection boundary exists. Guarded viewer actions depend on both. WS-D begins only after source behavior stabilizes.

## Milestone Strategy

1. **M1 — Contract truth:** optional context delivery, roadmap schema/lifecycle, cross-reference validation, and pure receipt projection pass focused tests.
2. **M2 — Promotion path:** CLI init/add/show/move/lifecycle and failure-safe promotion pass round-trip and negative-path tests.
3. **M3 — Evidence board:** roadmap workspace renders derived receipts, archive, source links, and staleness without write controls.
4. **M4 — Guarded interaction:** move/promotion actions, optional post-promotion handover, live refresh, and changed-card feedback pass server/UI checks.
5. **M5 — Release readiness:** docs, generated outputs, package assertions, full validation, browser smoke checks, and contract evidence agree.

## Rollout Strategy

- Keep roadmap adoption presence-based and optional. Existing repositories and projects remain valid.
- Ship CLI/schema/validator support before exposing viewer mutations.
- Enable the board automatically only when roadmap item files exist; otherwise show a concise empty/adoption state.
- Preserve unknown `roadmap_item` keys under rollback because current legacy readers tolerate unknown project frontmatter.
- Do not migrate existing projects or synthesize roadmap items.

## Test Strategy

- Unit-test roadmap filename/frontmatter/body parsing, lifecycle matrix, derived links, receipt totals, staleness clock, and absent/present context profile behavior.
- Add fixture tests for valid opt-in, missing item reference, invalid lifecycle combinations, terminal promotion, closure without evidence, open linked projects, and multiple projects per item.
- Exercise CLI help and every roadmap action in isolated temporary repositories, including partial-write cleanup.
- Extend viewer server tests for indexing, capability denial, hash conflicts, confirmation, whitelisting, audit receipts, promotion outputs, and SSE events.
- Add pure UI-domain tests for lane grouping, archive, receipts, staleness, and affected-card mapping; add focused component/source tests for board actions.
- Run viewer typecheck/lint/build, root `npm test`, package-manifest checks, mirror parity, `delano validate --release`, and package dry-run.
- Delegate live viewer smoke checks and screenshots through the repository’s Codex CLI browser rule.

## Rollback Strategy

- Revert viewer navigation/index/action wiring and rebuild public assets; roadmap Markdown remains readable as generic documents.
- Revert the CLI command registration and roadmap validators; existing project `roadmap_item` keys remain tolerated by older readers.
- Remove only generated runtime/payload changes through the normal rebuild process, never by editing `.claude/`, public assets, or payload files directly.
- Do not delete user-created vision, mission, roadmap items, or promoted projects during rollback.

## Remaining Delivery Risks

- The simple current frontmatter parser may need narrowly scoped list/enum handling for roadmap data without becoming a general YAML rewrite.
- Promotion failure cleanup must distinguish a newly created partial directory from any pre-existing user path.
- Cross-tier scans must remain linear and deterministic on Windows-sized portfolios.
- Viewer actions share `.delano/viewer/server.js`; task sequencing must prevent overlapping edits.
- Existing closeout artifacts are heterogeneous, so source-link presentation must avoid implying normalized impact data.
- NC-001 through NC-003 remain owner decisions; all tasks stay planned until they are confirmed.
