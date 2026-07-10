---
type: research_intake
project: delano-viewer-work-overview
slug: viewer-work-information-architecture
owner: Bart
status: closed
created: 2026-07-10T07:49:00Z
updated: 2026-07-10T07:53:51Z
---

# Research Plan: Viewer work information architecture

## Goal

Answer the research question and fold durable conclusions into canonical Delano project artifacts.

## Primary Question

How should the Delano viewer define and present actual updated files, completed work for review, and upcoming can/should/could work while adding consistent search, filter, and sort behavior to all tables?

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

Closed; findings folded forward into the project spec, plan, decisions, workstreams, and tasks.

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [x] Fold forward into canonical Delano project artifacts or explicitly close as no-action

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Treat Git history and working-tree state as actual file activity | Filesystem mtimes are rewritten by checkout and are not trustworthy historical recency. |
| Keep Review and Plan as derived workflow views | Delano task lifecycle remains canonical; the viewer must not invent review or can/should/could statuses. |
| Apply one table interaction contract everywhere | Search, filters, sorting, result counts, pagination reset, and empty states should behave consistently across workspace and project tables. |
| Use six mockup screens as the pre-implementation design gate | The user explicitly requested viewer-native mockups, Fable review to 9/10, and user feedback before implementation. |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
| None | Bart | N/A |
