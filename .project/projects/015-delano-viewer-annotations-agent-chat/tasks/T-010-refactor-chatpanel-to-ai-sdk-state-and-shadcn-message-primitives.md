---
id: T-010
name: Refactor ChatPanel to AI SDK state and shadcn Message primitives
status: done
workstream: WS-D
created: 2026-06-30T22:21:00Z
updated: 2026-06-30T22:57:11Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-009]
conflicts_with: []
parallel: true
priority: high
estimate: L
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Refactor ChatPanel to AI SDK state and shadcn Message primitives

## Description

Make the viewer chat consume the AI SDK stream through a maintainable client state layer while composing the real shadcn Message, Bubble, Attachment, Marker, and MessageScroller primitives.

## Acceptance Criteria

- [x] The chat surface uses MessageScrollerProvider, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton, Message, Bubble, Attachment, and Marker for the conversation UI.
- [x] The client no longer hand-rolls a raw scroll container or bespoke bubble markup.
- [x] Selected annotations render as structured shadcn Attachment items attached to the user turn.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- The current `ChatPanel` already imports shadcn `Message`, `MessageScroller`, `Bubble`, `Attachment`, and `Marker` primitives, but still owns manual SSE parsing and local message state.
- Implementation should verify whether AI SDK 7 `@ai-sdk/react` is appropriate for this Vite viewer, or whether a thin local adapter around the AI SDK stream contract is safer.
- Preserve the shadcn composition rule: conversation scroll is owned by `MessageScroller`; rows are `Message`; user attachment payloads are `Attachment`; empty/system notes are `Marker`.
- Avoid bespoke message bubble markup, bespoke sticky-scroll hooks, or raw scroll containers.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T22:57:11Z: ChatPanel now uses @ai-sdk/react useChat, DefaultChatTransport, and shadcn MessageScroller/Message/Bubble/Attachment/Marker primitives; UI typecheck and build passed.

- 2026-06-30T22:56:18Z: Refactored ChatPanel to @ai-sdk/react useChat and shadcn MessageScroller primitives.
- 2026-07-01T00:23:00Z: Replaced manual `fetch`/custom SSE parsing and local chat message state with `@ai-sdk/react` `useChat` and `DefaultChatTransport`.
- 2026-07-01T00:23:00Z: User turns store selected annotations in AI SDK message metadata and render them as shadcn `Attachment` items inside the user `Message`.
- 2026-07-01T00:23:00Z: Validation passed: `npm --prefix .delano/viewer/ui run typecheck` and `npm --prefix .delano/viewer/ui run build`.
- 2026-07-01T00:42:00Z: Claude follow-up review confirmed `ChatPanel` no longer silently swallows `sendMessage` failures; it restores the draft input and renders the submission error.
- 2026-06-30T22:21:00Z: Created from .project/templates/task.md by `delano task add`.
