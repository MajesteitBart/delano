---
id: T-004
name: Integrate Codex-backed chat with annotation attachments
status: done
workstream: WS-C
created: 2026-06-30T14:12:03Z
updated: 2026-06-30T14:55:55Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-003]
conflicts_with: []
parallel: false
priority: high
estimate: XL
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Integrate Codex-backed chat with annotation attachments

## Description

Add a chat endpoint and drawer submission flow that sends selected annotations and current document context to a Codex-backed chat transport.

## Acceptance Criteria

- [x] Chat transport uses AI SDK stream responses with an explicit read-only/default posture for initial release.
- [x] Submitted annotations appear as attachments with source path, selected quote, line or block anchor, and user comment.
- [x] The UI uses message scroller behavior so streamed replies stay stable without yanking users who scrolled up.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Delano should wrap Codex-backed chat behind a viewer endpoint rather than exposing credentials in the browser. T-009 later corrected the live backend to local `codex exec --json` with Codex CLI subscription auth and an AI SDK 7 UI message stream response.
- Plannotator's `packages/ui/components/ai/DocumentAIChatPanel.tsx`, `packages/ui/hooks/useAIChat.ts`, `packages/ai/endpoints.ts`, and `packages/ai/context.ts` show a provider-agnostic streaming shape plus document/annotation context builders.
- MessageScroller should be used for streamed replies with auto-scroll only while the user is already at the live edge.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T14:55:55Z: Added chat panel with message scroller behavior and annotation attachment pills; /api/ai/chat streams SSE responses, uses Codex harness when DELANO_VIEWER_CODEX=1, and validated deterministic no-write fallback in Chrome with selected annotation attachments.
- 2026-07-01T01:24:39+02:00: Follow-up T-009 replaced the earlier Codex harness direction with local Codex CLI subscription auth bridged into the AI SDK 7 UI message stream.
- 2026-06-30T15:20:00Z: Replaced the hand-rolled chat surface with shadcn CLI-installed MessageScroller, Message, Bubble, Attachment, InputGroup, Textarea, and Empty components.

- 2026-06-30T14:55:47Z: Drawer attachments are available; chat integration and no-write streaming fallback are implemented.
- 2026-06-30T14:12:03Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from AI SDK Codex harness, Shadcn MessageScroller, and Plannotator chat architecture.
