---
name: Viewer Annotations and Agent Handover
slug: 015-delano-viewer-annotations-agent-chat
owner: product
created: 2026-06-30T14:08:03Z
updated: 2026-07-01T21:40:31Z
---

# Decisions: Viewer Annotations and Agent Handover

## Active Decisions
- 2026-07-02: Handover also dispatches work, not only feedback.
  - Decision: task and workstream contracts get handover buttons with two intents. `start` hands the agent the contract to implement (read AGENTS.md and the owning spec/plan, meet the acceptance criteria, record evidence, update lifecycle via the delano CLI). `review` asks the agent to verify acceptance criteria and the evidence log against the implementation, carrying captured annotations along as reviewer feedback when they exist.
  - Rationale: the owner wants the viewer to trigger work and request review of delivered work directly from the contract surfaces, not only to relay content annotations.
  - Status: accepted and implemented.
- 2026-07-01: Replace embedded chat with agent handover.
  - Decision: remove the in-viewer chat surface and AI SDK dependencies. The primary review output is a handover: the server writes the selected annotations to a deterministic file under `.project/viewer/handovers/` and returns a `codex://new` deep link that opens the Codex app with the handover prompt (default), with terminal launch and a copyable one-line command as fallbacks for Codex and Claude Code. Export to markdown/JSON stays available as a secondary action.
  - Rationale: owner review found the embedded chat flimsy and the review surface cluttered. Handing the annotated feedback to a full coding agent is simpler and cheaper than maintaining a chat bridge, and it keeps the viewer guarded and read-focused while the agent works under its own CLI safety model.
  - Status: accepted and implemented.
- 2026-07-01: Annotation popovers are sticky and highlights are click-to-edit.
  - Decision: an unsaved annotation popover never closes on outside clicks; it closes only through Save, the close button, or Escape. Clicking an existing highlight reopens the popover in edit mode with comment, type, and delete controls.
  - Rationale: reviewers lose drafted feedback when popovers dismiss on stray clicks, and marked lines should be the natural entry point for editing existing feedback.
  - Status: accepted and implemented.
- 2026-06-30: Store annotations separately from canonical markdown.
  - Decision: annotation records live in a constrained repo-local store and reference `.project` documents by repo-relative path until a reviewer explicitly applies a change.
  - Rationale: this makes the viewer writable for review workflows without making comments or agent drafts mutate specs, plans, tasks, or context implicitly.
  - Status: accepted for planning.
- 2026-06-30: Treat file application as a separate reviewed workflow.
  - Decision: annotation exports and handover agents may propose edits, but `.project` markdown writes through viewer endpoints require a preview diff, stale-baseline check, and explicit apply action.
  - Rationale: user intent is to make the viewer more powerful, not to remove Delano's safety boundary around canonical delivery artifacts.
  - Status: accepted for planning.
- 2026-06-30: Keep hosted sharing optional.
  - Decision: local copy/download/export is in V1; Cloudflare-style remote artifacts require a follow-up privacy, retention, and hosting decision.
  - Rationale: remote sharing is valuable, but it changes data handling and should not block the core local Delano workflow.
  - Status: accepted for planning.

## Superseded Decisions
- 2026-06-30: Use AI SDK Codex harness for in-view chat.
  - Superseded by the 2026-07-01 local Codex CLI subscription-auth decision.
- 2026-07-01: Use local Codex CLI subscription auth for in-view chat.
  - Decision was: back live in-viewer chat with server-side `codex exec --json` bridged into AI SDK 7 UI message streams.
  - Superseded by the 2026-07-01 agent handover decision after owner review rejected embedded chat.

## Open Decision Questions
- Should annotation JSON and handover files be committed by default or treated as local draft state until exported?
- Which hosted sharing backend, if any, should Delano own or support?
