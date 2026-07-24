---
name: Delano Strategy Layer
slug: delano-strategy-layer
owner: bart
status: active
created: 2026-07-23T22:59:54Z
updated: 2026-07-24T06:35:24Z
outcome: A repository can opt into direction files and roadmap items, promote a roadmap item into one or more traceable delivery projects, and inspect derived delivery receipts on a live horizon board while repositories without roadmap artifacts validate unchanged.
uncertainty: medium
probe_required: false
probe_status: skipped
probe_decision_rationale: Repository inspection established the context-reader, state-command, validation, viewer-write, handover, live-event, and packaging extension points; the remaining choices are product policy decisions rather than prototype questions.
operating_mode: multi-stream
---

# Spec: Delano Strategy Layer

## Executive Summary

Delano currently proves delivery below the project boundary but does not explain why projects exist or which strategic bet they serve. This project adds a thin strategy layer without turning Delano into a portfolio scheduler:

`vision and mission context -> roadmap item -> delivery projects -> workstreams -> tasks -> evidence`

Vision and mission remain freeform, opt-in files in `.project/context/`. Roadmap items become the only new validated artifact type. A project may carry one optional `roadmap_item` reference; every reverse link and delivery receipt is derived from those project specs rather than copied into the roadmap item.

The product is an evidence-backed portfolio lens. The default viewer is a `now | next | later` board whose cards show source-linked delivery facts. It does not estimate, assign, sequence, forecast, or auto-close work. Promotion is a canonical state action that creates a planned project with strategic provenance; launching an agent is a separate, optional handover after creation.

## Adversarial Review of the Earlier Proposal

The earlier proposal found the right product boundary but understated several contract risks:

- Stored back-links would create two sources of truth. The project spec reference is authoritative; roadmap-to-project links must be derived.
- Promotion is not a third handover intent. Handover dispatches an agent and grants no write authority; promotion creates canonical contracts and must complete before an optional `start` handover.
- Git commit counts are not delivery evidence. Commits are not reliably mapped to projects, and closeout files are not yet a single canonical artifact shape. V1 receipts use project/task states, canonical timestamps, and links to source evidence.
- A timeline powered by target windows is scheduling by another name. It conflicts with the stated invariant and is excluded from v1.
- Adding optional vision/mission files directly to the current fixed context profile or fallback list would emit missing-file warnings in repositories that did not opt in. Profile inclusion must be presence-aware.
- The existing context audit does not enforce the earlier claim that every optional context file is checked for placeholder rot. Vision/mission are explicitly exempt from length/shape validation.
- `fs.watch` and SSE provide the invalidation signal, not the finished board behavior. Index refresh, affected-card derivation, and visual change feedback still require implementation and tests.
- A read-only public share link is not a cheap extension of an unauthenticated local viewer. It is a separate deployment, access-control, and privacy project.

## Problem and Users

- Repository owners can inspect delivery state but cannot record and browse strategic bets as addressable contracts.
- Operators cannot answer which projects serve a bet without manually correlating prose and project folders.
- Agents opening discovery receive repository context but no machine-resolvable strategic source.
- Existing project dashboards show delivery facts per project; there is no cross-project, evidence-backed strategic projection.

Primary users are repository owners setting direction, operators promoting strategic bets into delivery, and agents opening or reviewing the resulting project contracts.

## Outcome and Success Metrics

Outcome: a repository can opt into direction files and roadmap items, promote a roadmap item into one or more traceable delivery projects, and inspect derived delivery receipts on a live horizon board while repositories without roadmap artifacts validate unchanged.

- SM-001: `delano validate` passes for a fresh repository with no roadmap directory and for a repository initialized with valid vision, mission, and roadmap artifacts.
- SM-002: `delano roadmap promote RM-001 <project-slug>` creates a planned project whose spec contains `roadmap_item: RM-001`; no physical project list is written to RM-001.
- SM-003: Validation fails for malformed roadmap items, invalid lifecycle combinations, missing referenced items, or a `done` item without closure evidence and terminal linked projects.
- SM-004: The viewer board groups non-terminal items by horizon and shows linked-project states, task-state totals, last canonical delivery activity, and source links derived from current `.project` files.
- SM-005: Guarded viewer actions can move or promote an item only with a current hash, explicit confirmation, allowed fields/actions, and the same worktree capability checks as other canonical writes.
- SM-006: Existing SSE invalidation refreshes the board after roadmap or linked-project changes, and only affected cards receive change feedback.
- SM-007: New templates, rules, schemas, scripts, viewer assets, CLI help, and documentation are represented in the install payload and pass release validation.

## User Stories

- US-001: As a repository owner, I want concise vision and mission files in the context pack so that agents can understand durable direction.
- US-002: As an operator, I want addressable roadmap items grouped by horizon so that I can communicate strategic intent without dates or scheduling mechanics.
- US-003: As an operator, I want to promote a roadmap item into a planned delivery project so that the new project inherits strategic provenance.
- US-004: As a maintainer, I want roadmap contracts and project references validated so that traceability cannot silently rot.
- US-005: As an operator, I want each roadmap card to show linked delivery receipts so that status claims are inspectable at their source.
- US-006: As an operator, I want guarded structured board actions so that I can move or promote an item without unlocking arbitrary frontmatter.
- US-007: As an operator, I want stale `now` bets called out as advisory attention states so that the board exposes neglected commitments without inventing blockers.

## Acceptance Scenarios

- AC-001: Given no `.project/roadmap/` directory or roadmap references, when validation and context reading run, then behavior and output remain compatible with the current repository contract.
- AC-002: Given absent strategy files, when `delano roadmap init` runs, then it creates missing vision, mission, and roadmap index seeds without overwriting existing context files.
- AC-003: Given a valid roadmap item, when it is added or shown through the CLI, then its ID, status, horizon, timestamps, and body contract round-trip deterministically.
- AC-004: Given RM-001 is non-terminal, when it is promoted twice using two distinct project slugs, then both project specs reference RM-001 and the roadmap projection derives both links without mutating RM-001.
- AC-005: Given a project references a missing item, or a roadmap item violates the lifecycle matrix, when validation runs, then it fails with the affected artifact and rule.
- AC-006: Given linked projects and tasks exist, when the board opens, then the RM-001 card reports project-state counts, done/open/blocked task counts, last canonical delivery activity, and links to the source projects.
- AC-007: Given the viewer has a stale RM-001 hash, when a move or promotion is submitted, then the server returns a conflict and writes nothing.
- AC-008: Given RM-001 or a linked project changes on disk, when the SSE rescan publishes the change, then the board refreshes and RM-001 receives bounded change feedback.
- AC-009: Given a non-terminal item has `horizon: now` and no active linked project for 21 days, when the board model is derived, then it shows a non-blocking staleness reason.
- AC-010: Given RM-001 has at least one complete linked project, all linked projects are terminal, and closure evidence is supplied, when the operator closes it, then status becomes `done`; otherwise closure is rejected.
- AC-011: Given a terminal roadmap item, when promotion is attempted, then no project is created and the CLI/API returns a clear error.
- AC-012: Given viewer promotion succeeds, when the operator chooses to hand the created spec to an agent, then the existing `start` handover runs as a separate action against the new spec.

## Scope

### In Scope

- Presence-based, opt-in `vision.md` and `mission.md` context seeds and overview-profile delivery when present.
- One Markdown file per roadmap item under `.project/roadmap/`.
- Roadmap schema, lifecycle matrix, body contract, templates, validation, and fixtures.
- Optional `roadmap_item` on project specs, with one authoritative project-to-item link and derived reverse links.
- Native `delano roadmap` commands for init, add, show, move, lifecycle, and promotion.
- A pure roadmap projection that derives project/task receipts and staleness reasons from canonical files.
- Viewer roadmap workspace, source-linked cards, archive filter, guarded move/promotion actions, optional post-promotion handover, and live change feedback.
- Documentation, discovery-skill guidance, generated mirrors/assets, package coverage, and release checks.

### Out of Scope

- Dates, target windows, timeline, Gantt, dependencies, estimates, assignees, capacity, velocity, forecasts, or automatic prioritization.
- Stored project back-links on roadmap items or any second roadmap database/index file.
- Automatic roadmap closure, percentage-complete fields, or task-to-roadmap rollups written back into item files.
- Git commit counts as evidence or parsing heterogeneous closeout prose into a synthetic metric.
- More than one roadmap item per project in v1.
- Mandatory roadmap references for patches, maintenance, or legacy projects.
- Remote Linear/GitHub roadmap synchronization.
- Approval workflows that publish every lane change as a Review artifact.
- Public/read-only share links, hosted viewers, authentication, or client-facing deployment.
- Structural or minimum-length validation of vision and mission prose.

## Functional Requirements

- FR-001: `delano roadmap init` creates only missing `.project/context/vision.md`, `.project/context/mission.md`, and `.project/roadmap/README.md` seeds; it never overwrites existing files and reports created versus skipped paths.
- FR-002: Roadmap item files match `.project/roadmap/RM-###-<slug>.md` and require `id`, `name`, `status`, `horizon`, `created`, and `updated` frontmatter plus `Strategic intent`, `Outcome signal`, `Boundaries`, and `Closure evidence` body sections.
- FR-003: Roadmap status uses `planned | active | done | deferred`; horizon uses `now | next | later`. `active` requires `horizon: now` and at least one active linked project. Terminal items are excluded from open lanes and remain available in an archive view.
- FR-004: A project spec may contain one optional `roadmap_item: RM-###`. Validation resolves the reference when present; the reverse relationship is always derived by scanning project specs.
- FR-005: `delano roadmap promote` validates a non-terminal source item, reuses project-template creation, writes the roadmap reference into the created spec, and leaves the roadmap item byte-unchanged. Distinct project slugs may promote the same item repeatedly.
- FR-006: Promotion is failure-safe for the newly created target: a failed operation must not leave a partial project dossier. It never launches an agent implicitly.
- FR-007: The roadmap projection reports linked project states, done/open/blocked task totals, and the newest canonical `updated` value across linked project artifacts. It links to source evidence instead of inferring commit ownership or impact.
- FR-008: Closing an item requires a supplied closure-evidence entry, at least one linked project with `spec.status: complete`, and every linked project in `complete | deferred`. Closure remains an explicit operator action.
- FR-009: The viewer exposes a board-first roadmap workspace. Cards show strategic intent, status, receipt summary, staleness reasons, and source navigation; terminal items are available through an archive filter.
- FR-010: Structured viewer roadmap actions delegate to the same domain functions as the CLI and accept only whitelisted actions/fields. They require repository/worktree capability, current `expectedHash`, `confirm: true`, and an audit receipt.
- FR-011: The viewer may offer the existing `start` handover only after a promotion response identifies the newly created spec; promotion itself is not a handover intent.
- FR-012: Staleness is advisory and derived with an injectable clock. A non-terminal `now` item is stale after 21 days without an active linked project or linked delivery activity; an item whose linked projects are all terminal receives a closure-review reason.
- FR-013: Vision and mission join the overview context response only when the files exist. They are not added to the required fallback list, and their diagnostic audit classification is exempt from minimum word-count rules.
- FR-014: New runtime and viewer sources are mirrored or built through existing generation commands and explicitly asserted in package tests and the install manifest.

## Non-Functional Requirements

- NFR-001: Repositories that do not adopt the roadmap incur no missing-file warning, validation failure, or new required command.
- NFR-002: `.project` remains the only persisted source of truth; the viewer and CLI projections are recomputable.
- NFR-003: Canonical mutations are conflict-safe and scoped to resolved repository paths.
- NFR-004: Board derivation is deterministic for a fixed file snapshot and injected clock.
- NFR-005: Roadmap indexing and validation remain linear in roadmap plus project artifact count and do not invoke Git history.
- NFR-006: No local absolute paths or private machine data are written to contracts, docs, logs, or audit receipts.

## Assumptions

- One project has at most one primary roadmap parent in v1; a roadmap item may have many projects.
- A strategic item can sit in `now` before execution begins, but the staleness advisory makes prolonged non-action visible.
- Project spec/task states and canonical timestamps are reliable enough for a v1 receipt summary; impact measurement remains human-authored closure evidence.
- The existing viewer capability model can guard a structured roadmap endpoint without adding authentication.

## Needs Clarification

- NC-001: Confirm the default staleness window. Recommendation: 21 days, advisory only, with an injected clock for deterministic tests.
- NC-002: Confirm the manual closure gate. Recommendation: at least one complete linked project, all linked projects terminal, and a non-empty closure-evidence entry.
- NC-003: Confirm the adoption command. Recommendation: `delano roadmap init` non-destructively seeds vision, mission, and a roadmap README; `roadmap add` can also create the roadmap directory when init was skipped.

## Hypotheses and Unknowns

- H-001: Operators will maintain roadmap items if each card resolves directly to delivery receipts and never asks for project-management metadata.
- H-002: One authoritative project reference plus derived reverse links will survive manual edits and concurrent agent work better than synchronized link lists.
- H-003: Separating promotion from handover will make write authority and failure handling understandable without weakening the useful handoff flow.
- U-001: Product choice remains around the 21-day default and strictness of the closure gate; neither requires a prototype.
- U-002: The usefulness of a public share surface is unproven and cannot be evaluated safely inside this local-only feature.

## Touchpoints to Exercise

- `src/cli/index.js`, `src/cli/commands/`, and `src/cli/lib/project-state.js`.
- `.agents/schemas/`, `.agents/scripts/pm/validate.sh`, templates, fixtures, and package tests.
- `src/cli/lib/context-reader.js` and context-reader tests for absent/present optional profile files.
- `.delano/viewer/server.js`, viewer index/domain/navigation/pages, SSE behavior, guarded writes, and server/UI tests.
- Viewer source build, `.delano/viewer/public/`, `.claude/` mirror, `assets/install-manifest.json`, and `assets/payload/`.

## Probe Findings

No prototype is required. Repository inspection confirms reusable project creation, frontmatter mutation, generic Markdown indexing, hash-guarded canonical writes, capability checks, start/review handover, and debounced SSE index invalidation. The inspection also showed that optional context delivery, trustworthy evidence aggregation, physical back-link avoidance, and promotion/write-boundary semantics need explicit implementation rather than being free.

## Footguns Discovered

- The context reader currently treats profile filenames as fixed selections. Adding absent vision/mission files directly would generate warnings; adding them to fallback order would make them effectively required.
- The validation-time context audit checks the context directory as a whole, while other audit scripts use hardcoded file lists or word-count heuristics. None currently provides the earlier claimed opt-in vision/mission contract.
- `createProjectFromTemplates` writes a project dossier in place. Promotion needs failure cleanup or a staged write so an exception cannot leave a partial project.
- A stored roadmap `projects` list would require a multi-file transaction and drift repair. Derived links avoid that entire failure class.
- The viewer's `/api/handover` supports dispatch/review and intentionally does not mutate delivery contracts. Promotion must not be smuggled into that endpoint.
- SSE refreshes the index after filesystem changes, but card-level affected-item detection and change feedback are new behavior.
- Closeout files currently vary between `closeout.md` and `completion-summary.md` and do not share one machine schema. V1 must link to them, not parse them as a normalized metric.
- The install manifest cannot infer a forgotten new source file. This feature needs explicit package assertions for every new shipped artifact.

## Remaining Unknowns

Only NC-001 through NC-003 require owner confirmation before activation. The implementation paths and dependency boundaries are otherwise defined.

## Dependencies

- Existing state-command and project-template libraries.
- Artifact schema/validation pipeline and package fixtures.
- Context reader and diagnostic audit scripts.
- Viewer index, capability, apply-audit, handover, and SSE infrastructure.
- Existing generated mirror and package-asset workflows.

## Approval Notes

- 2026-07-24T06:35:24Z: Owner authorized WS-A delivery against the approved strategy-layer plan

The owner requested this adversarial rewrite and workstream/task decomposition on 2026-07-24. That authorizes planning artifacts but does not activate implementation. The project, plan, workstreams, and tasks remain `planned` until the owner confirms NC-001 through NC-003 or explicitly starts delivery.
