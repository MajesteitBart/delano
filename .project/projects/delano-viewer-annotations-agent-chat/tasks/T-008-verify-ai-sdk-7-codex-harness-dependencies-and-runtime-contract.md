---
id: T-008
name: Verify AI SDK 7 and Codex chat runtime contract
status: done
workstream: WS-D
created: 2026-06-30T22:20:40Z
updated: 2026-07-01T01:24:39+02:00
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-004]
conflicts_with: []
parallel: true
priority: high
estimate: M
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Verify AI SDK 7 and Codex chat runtime contract

## Description

Confirm the exact AI SDK 7 packages, Codex runtime options, environment flags, authentication shape, stream event contract, and package/install-manifest impact before replacing the current local fallback path.

## Acceptance Criteria

- [x] Current package versions for `ai` and `@ai-sdk/react` are recorded from npm or local docs; superseded harness package findings remain in evidence for traceability.
- [x] The viewer server contract defines a stable streaming response shape for annotation chat, including fallback behavior when Codex is unavailable.
- [x] Dependency and package payload changes are scoped and documented before implementation.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Current npm package availability checked on 2026-07-01:
  - `ai@7.0.9`
  - `@ai-sdk/react@4.0.10`
  - `@ai-sdk/harness@1.0.11`
  - `@ai-sdk/harness-codex@1.0.12`
- The root package currently has `ai@7.0.9` and `@ai-sdk/devtools@1.0.1`; follow-up T-009 removed the unused harness packages after the subscription-auth path moved to local Codex CLI.
- The viewer UI package currently has shadcn chat primitives installed, but no AI SDK client dependency.
- Verify against AI SDK 7 docs/source before implementation; `useChat` and provider APIs should not be inferred from older examples.
- Reference docs:
  - `https://ai-sdk.dev/providers/ai-sdk-harnesses/codex`
  - `https://ai-sdk.dev/providers/community-providers/codex-cli`
  - `https://ui.shadcn.com/docs/components/radix/message`
  - `https://ui.shadcn.com/docs/components/radix/message-scroller`

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T22:49:06Z: Recorded AI SDK 7 package versions, Codex harness sandbox/import/stream contract, and the AI SDK UI message stream response decision in the WS-D research findings.

- 2026-07-01T00:05:00Z: Verified local AI SDK package set: `ai@7.0.9`, `@ai-sdk/react@4.0.10`, `@ai-sdk/harness@1.0.11`, `@ai-sdk/harness-codex@1.0.12`, and `@ai-sdk/sandbox-vercel@1.0.11`.
- 2026-07-01T00:05:00Z: Verified Codex harness contract: import `HarnessAgent` from `@ai-sdk/harness/agent`, pass `createCodex()` as `harness`, provide a `createVercelSandbox()` sandbox provider, stream text from `result.fullStream`, and clean up with `session.destroy()`.
- 2026-07-01T00:05:00Z: Decided WS-D server contract is AI SDK UI message stream output from `createUIMessageStream` / `pipeUIMessageStreamToResponse`; disabled/offline fallback must use the same contract instead of custom `event: delta` SSE.
- 2026-07-01T01:24:39+02:00: Follow-up correction moved T-009 away from harness dependencies because the requested subscription-auth path is local Codex CLI auth. The root package now keeps `ai@7.0.9` and removes the unused harness packages.
- 2026-07-01T01:29:46+02:00: Focused validation passed for the corrected runtime contract: `node --check .delano\viewer\server.js`; `node --test test\viewer-server.test.js`; live `codex exec --json --sandbox read-only` smoke returned assistant text through the expected JSONL event.
- 2026-06-30T22:47:12Z: Researching AI SDK 7 Codex harness and shadcn MessageScroller contract before implementation.
- 2026-06-30T22:20:40Z: Created from .project/templates/task.md by `delano task add`.
