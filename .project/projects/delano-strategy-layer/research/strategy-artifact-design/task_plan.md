---
type: research_intake
project: delano-strategy-layer
slug: strategy-artifact-design
owner: team
status: completed
created: 2026-07-23T23:01:31Z
updated: 2026-07-24T01:03:35Z
---

# Research Plan: Strategy artifact design and roadmap-to-project traceability

## Goal

Answer the research question and fold durable conclusions into canonical Delano project artifacts.

## Primary Question

Which artifact shape (single strategy contract vs separate vision/mission/roadmap files), roadmap model (horizon vs sequence vs time-based), and traceability policy (optional vs required project-to-roadmap references) should the Delano strategy tier use, given the operating-modes rollout precedent and viewer/validation constraints?

## Scope

### In Scope

- Gather relevant evidence.
- Capture findings and decisions.
- Identify changes needed in `spec.md`, `plan.md`, `decisions.md`, workstreams, tasks, or updates.

### Out of Scope

- Marking delivery tasks done from research alone.
- External sync writes without normal Delano approval semantics.
- Storing secrets, credentials, or private machine paths.

## Current Phase

Completed and folded forward into a revised planned spec, delivery plan, decisions, workstreams, and tasks.

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [x] Fold forward into canonical project artifacts or explicitly close as no-action

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Repo-native investigation via three read-only sweeps (CLI architecture, validation/schema pipeline, viewer navigation) instead of a prototype probe | All three surfaces have working in-repo precedents (operating-modes rollout, reviews viewer tier, research scaffold); inspection bounded the implementation paths without building anything |
| Revised after owner feedback: vision/mission live in the existing `.project/context/` pack; only the roadmap is a new tier | The context pack already provides the correct prose boundary; a parallel tier would duplicate it |
| Persist only the optional project-to-roadmap reference and derive reverse links | A physical back-link list would create a multi-file transaction and a second source of truth |
| Treat promotion as a state mutation followed by an optional handover | Canonical contract creation and agent dispatch have different authority and failure semantics |
| Ship board-only v1 receipts from canonical project/task state | Commit counts, timeline targets, and heterogeneous closeout parsing would overstate what the current contracts prove |
| Keep vision/mission presence-aware and length-exempt | Fixed context profiles/fallbacks would warn in non-adopting repositories, and the runtime does not enforce a generic optional prose audit |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
| Owner confirmation of the 21-day staleness default, closure gate, and `roadmap init` seed behavior before activation | bart | At spec approval |
