---
type: research_intake
project: delano-viewer-annotations-agent-chat
slug: ai-sdk-message-scroller-gaps
owner: product
status: opened
created: 2026-06-30T22:39:21Z
updated: 2026-07-01T01:24:39+02:00
---

# Research Plan: AI SDK Message Scroller Gaps

## Goal

Answer the research question and fold durable conclusions into canonical Delano project artifacts.

## Primary Question

What gaps prevent WS-D from being a real AI SDK 7 annotation chat rendered with shadcn MessageScroller and backed by Codex subscription auth, and what implementation path should close them safely?

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

Fold forward

## Phases

- [x] Open research intake
- [x] Investigate sources and options
- [x] Summarize findings
- [ ] Fold forward into canonical project artifacts or explicitly close as no-action

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Use AI SDK UI message stream for both Codex and fallback | Keeps one client/server contract and lets `useChat` consume local fallback and live Codex responses identically. |
| Use local Codex CLI by default when `codex` is available | Codex subscription auth is available through the local CLI login; the default local viewer should use that path while retaining deterministic fallback when live Codex is unavailable. |
| Avoid `ai-sdk-provider-codex-cli` for T-009 | The current community provider is documented for AI SDK v6, while this repo uses AI SDK 7. The server bridges `codex exec --json` into the AI SDK 7 UI message stream instead. |
| Keep chat in the existing annotation workspace column for WS-D | Avoids a third nested drawer while still letting `MessageScroller` own the conversation scroll. |

## Blockers

| Blocker | Owner | Check-back |
| --- | --- | --- |
