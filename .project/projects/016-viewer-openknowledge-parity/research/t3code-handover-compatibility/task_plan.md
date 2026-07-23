---
type: research_intake
project: 016-viewer-openknowledge-parity
slug: t3code-handover-compatibility
owner: bart
status: concluded
created: 2026-07-10T09:48:22Z
updated: 2026-07-10T10:25:00Z
---

# Research Plan: T3 Code handover compatibility

## Goal

Answer the research question and fold durable conclusions into canonical Delano project artifacts.

## Primary Question

Can Delano hand over viewer work into T3 Code, ChatGPT/Codex, Codex CLI, and Claude Code using native session/deep-link mechanisms, and what is the smallest bridge if any is missing?

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

Implementation and validation

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [x] Fold forward into canonical project artifacts and validate the bridge

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Keep native Codex and Claude CLI handovers | Both CLIs accept an initial prompt directly, and the ChatGPT desktop app has a documented new-task deep link. |
| Build a standalone `t3code` handover CLI | T3's public CLI can issue scoped local sessions, and its orchestration HTTP contract can create projects, create threads, and start turns even though the upstream CLI has no thread command. |
| Do not depend on the open upstream thread-link PR | `t3://thread/<id>` is not merged and only targets an existing T3 thread ID, so it cannot create this handover. |
| Use project policy and workspace mode settings | `projectPolicy: create|existing` controls missing-project behavior; `workspaceMode: repo|folder` controls Git-root versus exact-folder resolution. |
| Use sequential HTTP thread commands | Stable v0.0.28's HTTP dispatch does not apply the web UI's bootstrap transform. The bridge sends `thread.create`, then `thread.turn.start`, and deletes the new thread if turn start fails. |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
