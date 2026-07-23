---
type: research_intake
project: 020-viewer-review-dashboard
slug: review-mode-dashboard
owner: bart
status: completed
created: 2026-07-13T21:53:25Z
updated: 2026-07-13T22:27:08Z
---

# Research Plan: Review Mode and Project Dashboard

## Goal

Answer the research question and fold durable conclusions into canonical Delano project artifacts.

## Primary Question

How should Delano gate annotation interactions to explicit Review mode, keep the review drawer overlay-only, and replace Project overview with a trustworthy dashboard using current contract data?

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

Complete

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [x] Fold forward into canonical project artifacts or explicitly close as no-action

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Review is an explicit viewer mode | Native text selection must remain ordinary reading behavior until the user activates Review. |
| The review panel remains a fixed overlay | The panel already has the correct spatial model; the reader compression comes from compensating page padding, not from the panel itself. |
| Project overview shows current-state delivery evidence | The index has trustworthy current status, workstream, task, and update data, but not enough history for a predictive velocity graph. |
| Use an execution map instead of a decorative chart | Workstream progress and task-state segments are actionable, honest, and directly navigable. |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
| None | bart | n/a |
