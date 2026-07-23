---
name: Delano Strategy Layer
slug: delano-strategy-layer
owner: bart
created: 2026-07-23T22:59:54Z
updated: 2026-07-23T23:08:00Z
---

# Decisions: Delano Strategy Layer

## Active Decisions

- D-001 (accepted): Skip the prototype probe. Research intake `strategy-artifact-design` resolved all technical unknowns by repository inspection; the operating-modes rollout, the viewer `reviews/` tier, and in-process `createProjectFromTemplates` reuse are working precedents. Remaining uncertainty is owner design choice, which a probe cannot retire.
- D-002 (accepted): Follow the operating-modes rollout pattern for the strategy tier: canonical schema in `.agents/schemas/`, rule doc, dedicated validator wired into `validate.sh`, templates, CLI defaults, install-manifest entries, `.claude/` mirror sync, docs, and tests.

## Proposed Decisions (pending owner approval at spec approval)

- D-003 (proposed, NC-001): Artifact shape is `vision.md`, `mission.md`, and one file per roadmap item under `.project/strategy/roadmap/RM-###-<slug>.md`.
- D-004 (proposed, NC-002): Roadmap items reuse the canonical `planned|active|done|deferred` status set plus a `horizon: now|next|later` field; no dated roadmaps in v1.
- D-005 (proposed, NC-003): Project traceability via an optional `roadmap_item` frontmatter key, validated when present, written automatically by `delano roadmap promote`; never required.
- D-006 (proposed, NC-005): Tier name `.project/strategy/`; command families `delano strategy` (init/show) and `delano roadmap` (add/promote/lifecycle/show).
- D-007 (proposed, NC-004/NC-006/NC-007): Vision/mission coexist with and cross-reference `PRODUCT.md`; v1 strategy consumption is read-only plus a discovery-skill runbook step; vision/mission lifecycle is minimal `active|superseded`.

## Superseded Decisions

- None.

## Open Decision Questions

- Owner confirmation or override of D-003 through D-007 at spec approval.
