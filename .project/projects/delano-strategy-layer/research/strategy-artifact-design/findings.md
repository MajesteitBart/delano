---
type: research_findings
project: delano-strategy-layer
slug: strategy-artifact-design
created: 2026-07-23T23:01:31Z
updated: 2026-07-24T01:03:35Z
---

# Findings: Strategy artifact design and roadmap-to-project traceability

## Conclusion

The strategy layer earns its place only as an evidence-backed portfolio lens. Vision and mission belong in the existing context pack; individually addressable roadmap items are the only new contract. The board is the primary projection, promotion is the primary state-changing interaction, and every visible delivery claim must resolve to canonical project/task artifacts.

The safe implementation is narrower than the prior proposal:

- persist a single optional project-to-roadmap reference and derive reverse links;
- make promotion a failure-safe domain action, then optionally hand the created spec to an agent;
- aggregate current contract facts, not Git commits or heterogeneous closeout prose;
- ship `now | next | later` plus archive, with no timeline or target windows;
- keep vision/mission optional and presence-aware so non-adopting repositories remain silent;
- expose staleness as an advisory projection, not a new lifecycle state.

## Repository Evidence

- `src/cli/lib/project-state.js` exports reusable project creation and frontmatter helpers, but project creation writes files in place and is not transaction-safe.
- `src/cli/lib/context-reader.js` uses fixed profile arrays and a fallback order. Adding absent vision/mission files directly to either structure would produce warnings or make them effectively required.
- `.agents/scripts/pm/validate.sh` invokes the coarse context scoring script; the other context audit scripts use different hardcoded or word-count rules. The current runtime does not enforce a generic optional vision/mission quality contract.
- `.delano/viewer/server.js` recursively indexes Markdown and protects canonical apply with worktree capabilities, expected hashes, confirmation, and audit records. Frontmatter is intentionally locked in the editor.
- `/api/handover` supports `annotations | start | review` and intentionally dispatches work without creating delivery contracts.
- The watcher publishes `index-changed` and per-document `doc-changed` events after a debounced full Markdown snapshot. Board refresh is enabled by this signal but still needs affected-card derivation and UI feedback.
- Project evidence is represented through task evidence logs, progress updates, statuses, and varied closeout files. There is no canonical commit-to-project mapping or single machine-readable closeout schema.
- The install manifest is an allowlist. New feature assets need explicit entries and package assertions; omission is not inferred automatically.

## Adversarial Findings

### AF-001: Physical back-links are a consistency trap

Writing both `spec.roadmap_item` and `roadmap.projects[]` creates a multi-file transaction, concurrent-write conflicts, partial-failure cleanup, and drift repair. The reverse link is cheaply derivable from project specs and should not be persisted.

### AF-002: Promotion is not a handover intent

Handover constructs and optionally launches an agent prompt; it does not grant write permission or create canonical contracts. Promotion must first create and validate a planned project. The viewer may then offer the existing `start` handover on the new spec.

### AF-003: “Commits of evidence” is status theater

Commits are repository-wide and evidence log commit fields are optional. Counting them by strategic item would require guesswork. V1 should show linked project states, task-state totals, latest canonical activity, and direct source links.

### AF-004: Timeline is scheduling pressure

An optional `target` field still creates date maintenance, lateness interpretation, and timeline theater. If the product invariant is “never a scheduling tool,” the honest v1 excludes targets and timeline rather than calling them conditional.

### AF-005: Optional context is not free

The overview profile currently selects fixed filenames even when absent. The correct change is optional profile members filtered by presence, not adding vision/mission to the fallback/required lists.

### AF-006: Audit language was stronger than runtime reality

The validation-time context audit does not score each optional file. Vision and mission should be explicitly freeform and exempt from minimum-length enforcement; their usefulness is an owner responsibility.

### AF-007: Live update is a primitive, not a feature

SSE invalidates the index, but a roadmap card can be affected by changes to the item, any linked spec, or any linked task/update. That dependency mapping and bounded flash behavior need a pure model and tests.

### AF-008: Manual closure still needs a proof gate

“Manual closure” without a required evidence note is another status toggle. A done item should require explicit closure evidence, at least one complete linked project, and no non-terminal linked projects.

### AF-009: Public sharing is a separate trust boundary

The viewer is unauthenticated and intentionally local. A share link requires hosting, access control, secret/privacy review, and a publication model. It is not a second-wave checkbox for this feature.

## Recommended Contract

### Direction files

- `.project/context/vision.md`
- `.project/context/mission.md`
- freeform seed templates;
- overview profile inclusion only when present;
- no lifecycle or structural/minimum-length validation.

### Roadmap item

- Path: `.project/roadmap/RM-###-<slug>.md`
- Required frontmatter: `id`, `name`, `status`, `horizon`, `created`, `updated`
- Required body sections: `Strategic intent`, `Outcome signal`, `Boundaries`, `Closure evidence`
- Status: `planned | active | done | deferred`
- Horizon: `now | next | later`
- No dates, targets, dependencies, estimates, assignments, project list, or percentage complete.

### Traceability and promotion

- Optional `roadmap_item: RM-###` on project specs.
- One roadmap parent per project, many projects per roadmap item.
- Reverse links derived from project specs.
- Promotion creates a planned project and does not mutate the source item.
- Terminal items cannot be promoted.
- Agent handover is offered only after project creation succeeds.

### Board receipts

- linked project counts by spec state;
- done/open/blocked task totals;
- latest canonical `updated` value across linked project artifacts;
- direct links to project, progress, evidence, and closeout artifacts when present;
- staleness reasons derived with an injected clock.

## Options Rejected

| Option | Reason rejected |
| --- | --- |
| Parallel `.project/strategy/` prose tier | Duplicates the context pack and its reader/viewer boundary. |
| Stored `projects` array on roadmap item | Creates two sources of truth and multi-file transactions. |
| Promotion as `intent: promote` on `/api/handover` | Conflates dispatch with canonical mutation and write authority. |
| Commit count on roadmap cards | No reliable project mapping; optional evidence metadata. |
| Automatic item closure | One project completion does not prove a strategic outcome. |
| Timeline or target windows in v1 | Reintroduces scheduling semantics and stale date maintenance. |
| Lane-change Review artifacts | Adds a second approval/state workflow before need is proven. |
| Public share link | Requires a new hosting/auth/privacy boundary. |
| Mandatory project roadmap parent | Breaks patches, maintenance, legacy projects, and opt-in adoption. |

## Fold-Forward

- `spec.md` now defines the single-source relationship, promotion boundary, evidence projection, closure gate, board-only scope, optional context behavior, and staleness policy.
- `decisions.md` records the revised recommendations and superseded assumptions.
- `plan.md` splits contract/projection, CLI/promotion, viewer, and release ownership.
- Workstreams and tasks decompose the implementation with acyclic dependencies and binary acceptance criteria.

## Open Product Decisions

- Accept or change the 21-day advisory threshold.
- Accept or relax the strict terminal-project closure gate.
- Confirm `delano roadmap init` as the non-destructive seed command.

No technical prototype is required for these choices.
