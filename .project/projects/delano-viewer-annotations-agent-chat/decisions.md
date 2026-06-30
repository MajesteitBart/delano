---
name: Viewer Annotations and Agent Chat
slug: delano-viewer-annotations-agent-chat
owner: product
created: 2026-06-30T14:08:03Z
updated: 2026-06-30T14:20:00Z
---

# Decisions: Viewer Annotations and Agent Chat

## Active Decisions
- 2026-06-30: Store annotations separately from canonical markdown.
  - Decision: annotation records live in a constrained repo-local store and reference `.project` documents by repo-relative path until a reviewer explicitly applies a change.
  - Rationale: this makes the viewer writable for review workflows without making comments or agent drafts mutate specs, plans, tasks, or context implicitly.
  - Status: accepted for planning.
- 2026-06-30: Treat file application as a separate reviewed workflow.
  - Decision: chat responses and annotation exports may propose edits, but `.project` markdown writes require a preview diff, stale-baseline check, and explicit apply action.
  - Rationale: user intent is to make the viewer more powerful, not to remove Delano's safety boundary around canonical delivery artifacts.
  - Status: accepted for planning.
- 2026-06-30: Use AI SDK Codex harness for in-view chat.
  - Decision: plan for a Codex-backed chat transport through AI SDK harnesses and submit annotation bundles as structured attachments.
  - Rationale: the requested direction replaces large deeplink prompts with a live, file-aware agent surface and matches the AI SDK documentation.
  - Status: accepted for planning.
- 2026-06-30: Keep hosted sharing optional.
  - Decision: local copy/download/export is in V1; Cloudflare-style remote artifacts require a follow-up privacy, retention, and hosting decision.
  - Rationale: remote sharing is valuable, but it changes data handling and should not block the core local Delano workflow.
  - Status: accepted for planning.

## Superseded Decisions
- None.

## Open Decision Questions
- Should annotation JSON be committed by default or treated as local draft state until exported?
- Should the viewer adopt a bundled React/Shadcn app stack before implementing chat components?
- Which hosted sharing backend, if any, should Delano own or support?
