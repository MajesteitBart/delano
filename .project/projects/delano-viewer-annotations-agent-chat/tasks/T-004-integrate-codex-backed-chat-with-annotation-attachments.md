---
id: T-004
name: Integrate Codex-backed chat with annotation attachments
status: ready
workstream: WS-C
created: 2026-06-30T14:12:03Z
updated: 2026-06-30T14:24:00Z
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

Add a chat endpoint and drawer submission flow that sends selected annotations and current document context to the AI SDK Codex harness.

## Acceptance Criteria

- [ ] Chat transport uses AI SDK harness Codex with streaming responses and an explicit read-only/default sandbox posture for initial release.
- [ ] Submitted annotations appear as attachments with source path, selected quote, line or block anchor, and user comment.
- [ ] The UI uses message scroller behavior so streamed replies stay stable without yanking users who scrolled up.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- AI SDK Codex harness docs show `HarnessAgent` with `@ai-sdk/harness-codex`, `agent.createSession()`, `agent.stream(...)`, and `text-delta` streaming; Delano should wrap this behind a viewer endpoint rather than exposing credentials in the browser.
- Plannotator's `packages/ui/components/ai/DocumentAIChatPanel.tsx`, `packages/ui/hooks/useAIChat.ts`, `packages/ai/endpoints.ts`, and `packages/ai/context.ts` show a provider-agnostic streaming shape plus document/annotation context builders.
- MessageScroller should be used for streamed replies with auto-scroll only while the user is already at the live edge.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-30T14:12:03Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from AI SDK Codex harness, Shadcn MessageScroller, and Plannotator chat architecture.
