---
name: Delano Strategy Layer
slug: delano-strategy-layer
owner: bart
status: planned
created: 2026-07-23T22:59:54Z
updated: 2026-07-23T23:08:00Z
outcome: Vision, mission, and roadmap exist as first-class validated Delano contracts, and new delivery projects can declare roadmap traceability that delano validate enforces.
uncertainty: medium
probe_required: false
probe_status: skipped
probe_decision_rationale: Research intake strategy-artifact-design resolved the technical unknowns by repository inspection (operating-modes rollout, reviews viewer tier, and in-process project creation are working precedents); remaining uncertainty is owner design choice, not buildable risk.
operating_mode: uncertain-feature
---

# Spec: Delano Strategy Layer

## Executive Summary

Delano's canonical model today starts at a single project's outcome: `Outcome -> Spec -> Delivery project -> Workstreams -> Tasks -> Evidence`. Nothing above the project tier explains why a project exists, which direction it serves, or what should be delivered next at portfolio level. This spec introduces a strategy tier: durable vision and mission contracts plus a roadmap whose items translate into delivery projects with enforced traceability. Strategy artifacts follow the same file-backed, validated, CLI-managed contract pattern as the delivery tier, and adoption is opt-in so existing repositories and closed projects are untouched.

## Problem and Users

- Operators and maintainers can inspect delivery state (`delano status`, viewer) but have no canonical place to record or read strategic direction. Direction lives in heads, chat threads, or ad-hoc docs outside `.project/`.
- `delano next` answers "which task next" but nothing answers "which project should exist next" or "does this proposed project serve the current direction".
- Coding agents get delivery contracts and context files, but no strategic frame; a request like "does this feature fit the product direction" is unanswerable from disk.
- `PRODUCT.md` (in this repo) captures product identity for design purposes, but it is not part of the installable operating model, has no contract surface, and does not connect to projects.

Users: repository owners/maintainers who set direction, operators who select and scope new projects, and coding agents that need strategic context when opening discovery for new work.

## Outcome and Success Metrics

Outcome: vision, mission, and roadmap exist as first-class validated Delano contracts, and new delivery projects can declare roadmap traceability that `delano validate` enforces.

Success metrics (binary at closeout):

- SM-001: A repository can initialize strategy contracts via the CLI, and `delano validate` passes on a fresh clone with and without strategy artifacts present.
- SM-002: A roadmap item can be promoted into a delivery project through the CLI, and the created project carries a machine-readable reference to that item.
- SM-003: `delano validate` fails when a project references a missing roadmap item, when a roadmap item has an invalid state, or when required strategy frontmatter keys are absent.
- SM-004: The viewer renders strategy contracts as navigable documents alongside projects.
- SM-005: `HANDBOOK.md`, `AGENTS.md`, and the domain concept docs describe the strategy tier, and the packaged runtime assets include the new templates without package-manifest drift.

## User Stories

- US-001: As a repository owner, I want to record vision and mission as durable contracts in `.project/`, so that direction is inspectable on disk next to delivery state.
- US-002: As an operator, I want a roadmap of strategic items with explicit states/horizons, so that I can see what is now, next, and later without a tracker.
- US-003: As an operator, I want to promote a roadmap item into a delivery project with one CLI action, so that new projects start traceable to strategy instead of ad hoc.
- US-004: As a maintainer, I want `delano validate` to check strategy contracts and roadmap references, so that strategic traceability cannot silently rot.
- US-005: As a coding agent, I want discovery to read strategy contracts when opening a new spec, so that outcome hypotheses can be checked against stated direction.
- US-006: As an operator, I want to browse vision, mission, and roadmap in the viewer, so that strategic context is readable in the same surface as delivery contracts.

## Acceptance Scenarios

- AC-001: Given a repository without strategy artifacts, when `delano validate` runs, then validation passes unchanged (strategy tier is opt-in).
- AC-002: Given `delano strategy init` (final command name may differ) has run, when the operator opens `.project/strategy/`, then vision, mission, and roadmap contracts exist from templates with valid frontmatter.
- AC-003: Given a roadmap with item RM-001 in an actionable state, when the operator promotes RM-001, then a delivery project is created whose frontmatter references RM-001 and RM-001 records the project slug.
- AC-004: Given a project referencing a roadmap item that does not exist, when `delano validate` runs, then validation fails with a message naming the project and the missing item.
- AC-005: Given strategy contracts exist, when the viewer is opened, then vision, mission, and roadmap are listed and render as documents.
- AC-006: Given a pre-existing project without any roadmap reference, when `delano validate` runs, then that project validates under legacy rules only.

## Scope

### In Scope

- Strategy artifact contracts (vision, mission, roadmap) with templates, frontmatter schema, and canonical states for roadmap items.
- CLI lifecycle surface for creating/updating strategy artifacts and for promoting roadmap items into projects.
- Validation rules wiring strategy contracts and project-to-roadmap references into `delano validate`.
- Viewer read support for strategy artifacts.
- Handbook, AGENTS.md, domain docs, and packaged asset/template updates.

### Out of Scope

- OKR or KPI tracking, scoring, and progress rollups from tasks to strategy.
- Multi-repository portfolio rollups; strategy scope is one repository.
- Remote tracker (Linear/GitHub) synchronization of roadmap items in the first release; mapping design may be noted but not implemented.
- Editing strategy documents from the viewer beyond the existing guarded canonical-apply path.
- Automatic generation of specs/plans from roadmap items without operator approval.
- Rewriting closed historical projects to add traceability fields.

## Functional Requirements

- FR-001: Strategy contracts live under `.project/` in a dedicated tier (working assumption: `.project/strategy/`) as Markdown with frontmatter, first block, per the frontmatter rule.
- FR-002: Roadmap items are individually addressable (ID pattern like RM-###), carry a state from a canonical set, and support an ordering or horizon signal (for example now/next/later).
- FR-003: Project frontmatter supports an optional roadmap reference key; the CLI writes it during promotion, and validation resolves it against the roadmap.
- FR-004: Promotion is operator-triggered, reuses `delano project create` semantics (templates, operating-mode defaults), and back-links the created project on the roadmap item.
- FR-005: Strategy artifacts follow the datetime rule (UTC ISO8601 `created`/`updated`, immutable `created`).
- FR-006: `delano status` (or an equivalent read command) can summarize the strategy tier; exact surface decided in planning.
- FR-007: New templates are added to `.project/templates/`, mirrored into packaged assets, and covered by `npm run check:package-manifest`.
- FR-008: A drift check compares the `.project/templates/` directory (and new strategy schema/script files) against `assets/install-manifest.json` entries so a forgotten manifest line fails validation instead of failing silently at install time.

## Non-Functional Requirements

- NFR-001: Zero breaking change for repositories without strategy artifacts; contracts-only validation must keep passing on a fresh clone.
- NFR-002: Strategy tier follows existing conventions (kebab-case slugs, frontmatter contract keys, status sets defined in `.agents/schemas/`), not a parallel format.
- NFR-003: Viewer treatment stays document-like and read-only in spirit, consistent with `PRODUCT.md` design principles.
- NFR-004: No machine-local or absolute paths in strategy artifacts (path privacy rule).

## Assumptions

- The operating-modes rollout is the precedent to copy: canonical machine-readable schema plus rule doc plus templates plus opt-in validation, with legacy artifacts keeping legacy validation.
- Strategy is per-repository; a repository's `.project/` remains the single source of truth for its own direction.
- The existing CLI command framework in `src/cli/` can host a new command family without structural rework.
- Vision and mission change rarely; roadmap items change often. Contract design should make the roadmap the mutable surface.

## Needs Clarification

Research intake `strategy-artifact-design` produced recommendations for each item (rationale in `research/strategy-artifact-design/findings.md`). Owner confirms or overrides at spec approval.

- NC-001: Artifact shape. Recommendation: separate `vision.md` and `mission.md` plus one file per roadmap item under `.project/strategy/roadmap/RM-###-<slug>.md`, mirroring the task-file pattern for addressability and per-item frontmatter.
- NC-002: Roadmap model. Recommendation: lifecycle status reusing the canonical `planned|active|done|deferred` set plus a separate `horizon: now|next|later` field; no dated roadmaps in v1.
- NC-003: Traceability policy. Recommendation: optional `roadmap_item` key on projects, validated when present, written automatically by the promote action; never required (mirrors the `operating_mode` rollout posture).
- NC-004: Relationship to `PRODUCT.md` and `.project/context/product-context.md`. Recommendation: coexist and cross-reference; strategy contracts join the installable operating model, `PRODUCT.md` stays a repo-level design-identity doc. Owner taste call.
- NC-005: Naming. Recommendation: tier `.project/strategy/`; command families `delano strategy` (init/show) and `delano roadmap` (add/promote/lifecycle/show), matching the flat family precedent.
- NC-006: Strategy consumption by `delano next`/discovery-skill. Recommendation: read-only presence in v1 plus a discovery-skill runbook step to read strategy contracts when opening a spec; no `delano next` integration yet.
- NC-007: Vision/mission lifecycle. Recommendation: minimal `active|superseded`; no `operating_mode`-style maturity field for the strategy tier.

## Hypotheses and Unknowns

- H-001: A thin, opt-in strategy tier will be adopted because it mirrors the contract patterns operators already use; heavyweight portfolio tooling would not be.
- H-002: Roadmap-item-to-project promotion is the single interaction that makes the tier real; without it, vision/mission become dead documents.
- H-003: Validation of references (project to roadmap item) is cheap to implement in the existing validate pipeline; the risky surface is viewer navigation and packaged-asset drift.
- U-001: Resolved. Viewer file discovery is generic over `.project/**/*.md`; navigability requires small additions to three hardcoded allowlists (server fixed-tier array, client workspace nav, artifact-role classifier). The `reviews/` tier is the working precedent; the `templates` tier warns that skipping UI wiring leaves docs indexed but invisible.
- U-002: Resolved. Spec-kit import maps a fixed section list and ignores unknown keys; Linear/GitHub sync readers consume a fixed key set and tolerate extras. No constraint on adding `roadmap_item` or new artifact types.

## Touchpoints to Exercise

- `src/cli/` command registration and `project create` flow (promotion path).
- `.agents/scripts/pm/validate.sh` and `.agents/schemas/` (artifact scope, status transitions, operating modes).
- `.project/templates/` and `assets/` payload build (`npm run build:assets`, `npm run check:package-manifest`).
- Viewer document listing/navigation for a non-project artifact tier.
- `HANDBOOK.md` sections 3 (canonical model), 6 (data contracts), 8 (CLI command map).

## Probe Findings

Probe skipped. Research intake `strategy-artifact-design` resolved the technical unknowns by repository inspection instead of a prototype: the operating-modes rollout (commits `52a5157`, `20ffea6`) is a mechanical precedent for schema + rule doc + validator + templates + CLI defaults + manifest + mirror; `createProjectFromTemplates` is reusable in-process for promotion; viewer support is an additive ~5-file change. Remaining uncertainty is owner design choice (NC-001 through NC-007 recommendations), retirable at spec approval without building anything.

## Footguns Discovered

- Template/payload drift is worse than assumed: `assets/install-manifest.json` is a flat allowlist and `check:package-manifest` compares manifest↔payload only, so a new template missing from the manifest passes release validation and fails silently at install time (`Missing template` at `readTemplate`). A directory-vs-manifest drift check does not exist and is an in-scope hardening item (FR-008).
- `.claude/` is a generated mirror; any skill/rule/schema changes for strategy must be made in `.agents/` and synced via `npm run sync:claude-mirror`.
- New artifact types do not self-register: `requiredArtifactTypes` in `check-artifact-scope.mjs` and `KNOWN_ARTIFACT_KINDS` in `check-operating-modes.mjs` are hardcoded lists that must be extended alongside `artifact-scope.json`.
- The strategy tier lives outside `.project/projects/<slug>/`, so no existing validator walks it; it needs its own walker wired into `validate.sh`.

## Remaining Unknowns

- Owner confirmation or override of NC-001 through NC-007 recommendations at spec approval. No open technical unknowns.

## Dependencies

- Existing validation pipeline and schema layout under `.agents/schemas/`.
- Packaged asset build and install manifest (`assets/install-manifest.json`).
- Viewer document rendering pipeline.
- Handbook update discipline (source-of-truth precedence).

## Approval Notes

Draft. Not approved for planning. Research intake `strategy-artifact-design` is complete: findings, options, and recommendations for NC-001 through NC-007 are in `research/strategy-artifact-design/findings.md`, and proposed decisions are in `decisions.md`. The probe decision (skipped, by inspection) is recorded above. Owner action to unblock planning: confirm or override the NC recommendations, then approve the spec.
