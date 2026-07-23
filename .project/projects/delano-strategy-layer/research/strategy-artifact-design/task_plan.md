---
type: research_intake
project: delano-strategy-layer
slug: strategy-artifact-design
owner: team
status: opened
created: 2026-07-23T23:01:31Z
updated: 2026-07-23T23:08:00Z
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

Folded forward; awaiting owner approval of proposed decisions at spec approval.

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [x] Fold forward into canonical project artifacts or explicitly close as no-action

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Repo-native investigation via three read-only sweeps (CLI architecture, validation/schema pipeline, viewer navigation) instead of a prototype probe | All three surfaces have working in-repo precedents (operating-modes rollout, reviews viewer tier, research scaffold); inspection bounded the implementation paths without building anything |
| Recommendations for NC-001, NC-002, NC-003, NC-005 recorded in `findings.md` as proposed, not final | Artifact shape, roadmap model, traceability policy, and naming ship in the operating model; owner approves at spec approval per the project's approval gate |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
