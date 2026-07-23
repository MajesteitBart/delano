---
type: research_intake
project: 015-delano-viewer-annotations-agent-chat
slug: plannotator-agent-chat-integration
owner: product
status: completed
created: 2026-06-30T14:08:10Z
updated: 2026-06-30T14:22:00Z
---

# Research Plan: Plannotator-style annotations and agent chat integration

## Goal

Answer the research question and fold durable conclusions into canonical Delano project artifacts.

## Primary Question

Which Plannotator annotation, export, and agent-chat patterns should Delano viewer adopt so .project markdown can be annotated, reviewed in a drawer, and submitted to Codex-backed chat without unsafe write behavior?

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

Completed

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [x] Fold forward into canonical project artifacts or explicitly close as no-action

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Keep canonical markdown separate from annotation storage | Plannotator shows annotation objects can be persisted separately and replayed into the UI; Delano should avoid mutating `.project` contracts until a user applies a reviewed change. |
| Put path-safe annotation endpoints before UI polish | The viewer is currently read-only, so the first risk is write scope, not highlighting. |
| Use Codex chat as a transport, not an apply mechanism | AI SDK Codex harness can stream an answer, but Delano still needs its own apply gate for file writes. |
| Defer Cloudflare-style sharing to an opt-in task | Remote artifacts add privacy, retention, and hosting choices that should not block local annotation/chat workflows. |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
| Shadcn Chat components may require a viewer build-stack migration before implementation. | product | Before T-004 implementation |
| Hosted sharing backend owner and privacy posture are not decided. | product | During T-006 |
