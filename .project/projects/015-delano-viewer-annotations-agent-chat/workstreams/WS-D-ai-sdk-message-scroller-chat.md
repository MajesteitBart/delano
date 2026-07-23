---
id: WS-D
name: WS-D AI SDK Message Scroller Chat
owner: product
status: done
created: 2026-06-30T22:20:30Z
updated: 2026-06-30T23:37:39Z
operating_mode: uncertain-feature
---

# Workstream: WS-D AI SDK Message Scroller Chat

## Objective
Replace the current local/manual chat fallback with a real AI SDK 7 annotation chat while preserving Delano's guarded write boundaries. The viewer should let reviewers send selected annotations as structured attachments and read streamed responses inside a real shadcn `MessageScroller` conversation surface; live Codex responses use the local Codex CLI subscription-auth path whenever `codex` is available on `PATH`.

## Owned Files/Areas
- `.delano/viewer/server.js`
- `.delano/viewer/ui/src/components/organisms/ChatPanel.tsx`
- `.delano/viewer/ui/src/components/ui/message.tsx`
- `.delano/viewer/ui/src/components/ui/message-scroller.tsx`
- `.delano/viewer/ui/src/components/ui/attachment.tsx`
- `.delano/viewer/ui/src/components/ui/bubble.tsx`
- `.delano/viewer/ui/src/components/ui/marker.tsx`
- `.delano/viewer/ui/package.json`
- `package.json`
- `test/viewer-server.test.js`
- `docs/viewer-guide.md`

## Dependencies
- Depends on `T-004`, which established the first chat attachment flow.
- Depends on the existing annotation store and drawer behavior from `WS-A` and `WS-B`.
- Must verify current AI SDK 7 packages before implementation: `ai` and `@ai-sdk/react`, plus the local Codex CLI event shape for the subscription-auth backend.
- Must use the installed shadcn/Radix chat primitives rather than visually similar local markup.

## Risks
- Codex CLI availability and login state vary by environment; the viewer must retain a clear disabled/fallback mode.
- Direct agent responses must not become a file-write path. File mutation remains behind preview/apply with stale-baseline checks.
- Chat placement can create confusing nested scroll regions on tablet if the annotation drawer, message scroller, and metadata panel all scroll independently.
- Package payload size and install-manifest changes must remain explicit because Delano ships the viewer as packaged static assets plus a local server.

## Handoff Criteria
- The workstream records the final package set and runtime flags for enabling Codex-backed chat.
- The server streams local Codex CLI-backed chat responses or a deterministic fallback using one AI SDK UI message stream response contract.
- The chat UI composes shadcn `Message`, `MessageScroller`, `Bubble`, `Attachment`, and `Marker` primitives.
- A placement decision documents whether chat lives in the sidebar, a stacked column, or a drawer/sheet at desktop and tablet widths.
- Browser evidence proves selected annotations can be sent as chat attachments, streamed responses stay anchored, and temporary smoke annotations are cleaned up.
