---
name: Delano Strategy Layer
slug: delano-strategy-layer
owner: bart
created: 2026-07-23T22:59:54Z
updated: 2026-07-24T01:03:35Z
---

# Decisions: Delano Strategy Layer

## Active Decisions

- D-001 (accepted): Skip the prototype probe. Repository inspection resolved the technical extension points; remaining uncertainty is product policy.
- D-002 (accepted): Follow the established contract rollout pattern for roadmap artifacts: canonical schema and rule, validator wiring, templates, CLI behavior, viewer projection, package representation, documentation, and tests.
- D-003 (accepted): Reuse `.project/context/` for vision and mission rather than create a parallel prose tier. Only roadmap items introduce a new artifact contract.
- D-004 (accepted): The product boundary is an evidence-backed portfolio lens, never a scheduler. Dependencies, estimates, assignments, velocity, forecasts, timeline, and Gantt are excluded from v1.

- D-005 (accepted): Use `.project/context/vision.md`, `.project/context/mission.md`, and one roadmap item per `.project/roadmap/RM-###-<slug>.md`. `delano roadmap init` seeds only missing files.
- D-006 (accepted): Treat vision and mission as presence-based optional overview context. Do not add them to the required fallback list and do not validate their structure or minimum length.
- D-007 (accepted): Roadmap items use `status: planned|active|done|deferred` plus `horizon: now|next|later`. Terminal items leave the open board and remain in an archive.
- D-008 (accepted): Persist only `spec.frontmatter.roadmap_item`. Derive roadmap-to-project links by scanning project specs; never store or synchronize a `projects` list on roadmap items.
- D-009 (accepted): `delano roadmap promote` is a canonical domain mutation that creates a planned project and leaves the source item byte-unchanged. Agent dispatch is an optional, separate `start` handover after successful creation.
- D-010 (accepted): V1 receipts are linked-project states, done/open/blocked task totals, newest canonical activity time, and source links. Git commit counts, completion percentages, and normalized closeout metrics are excluded.
- D-011 (accepted): Closing a roadmap item is manual and evidence-gated: at least one linked project is complete, all linked projects are terminal, and the close action appends non-empty closure evidence.
- D-012 (accepted): Viewer roadmap mutations use one structured, guarded action endpoint that delegates to the same domain service as the CLI; arbitrary frontmatter remains locked.
- D-013 (accepted): Staleness is a 21-day, clock-injected advisory for non-terminal `now` items without active delivery or recent linked activity. It never changes status or blocks validation.
- D-014 (accepted): Ship a board and archive only. Timeline/target windows, public share links, and review-artifact approval workflows require separate evidence and projects.

## Superseded Decisions

- The original D-003/D-006/D-007 strategy-tier design is superseded by D-003/D-005/D-006 above: context files already provide the correct prose boundary.
- The earlier timeline portion of D-010 is superseded by D-004/D-014 because target windows would reintroduce scheduling behavior before there is user evidence for it.
- The earlier physical back-link reading of D-011 is superseded by D-008. One-way persisted references remove the multi-file transaction and drift class.
- The earlier “promotion as a third handover intent” proposal is superseded by D-009. Handover dispatch and canonical creation have different authority and failure semantics.

## Decision Confirmation

- 2026-07-24: The owner authorized WS-A delivery against the planned spec and plan, confirming the recommended defaults in D-005, D-011, and D-013.
