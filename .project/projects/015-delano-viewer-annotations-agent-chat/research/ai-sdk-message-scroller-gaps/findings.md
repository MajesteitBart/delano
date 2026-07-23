---
type: research_findings
project: 015-delano-viewer-annotations-agent-chat
slug: ai-sdk-message-scroller-gaps
created: 2026-06-30T22:39:21Z
updated: 2026-07-01T01:24:39+02:00
---

# Findings: AI SDK Message Scroller Gaps

## Source References

- Local packages:
  - `ai@7.0.9`
  - `@ai-sdk/react@4.0.10`
- Investigated before T-009 correction, then superseded by the local Codex CLI path:
  - `@ai-sdk/harness@1.0.11`
  - `@ai-sdk/harness-codex@1.0.12`
  - `@ai-sdk/sandbox-vercel@1.0.11`
- Local package docs/types investigated during the harness probe:
  - `node_modules/@ai-sdk/harness/README.md`
  - `node_modules/@ai-sdk/harness/dist/agent/index.d.ts`
  - `node_modules/@ai-sdk/harness-codex/README.md`
  - `node_modules/@ai-sdk/harness-codex/dist/index.d.ts`
  - `node_modules/@ai-sdk/sandbox-vercel/README.md`
  - `node_modules/ai/dist/index.d.ts`
  - `.delano/viewer/ui/node_modules/@ai-sdk/react/dist/index.d.ts`
- Viewer implementation:
  - `.delano/viewer/server.js`
  - `.delano/viewer/ui/src/components/organisms/ChatPanel.tsx`
- External reference docs:
  - `https://ai-sdk.dev/providers/ai-sdk-harnesses/codex`
  - `https://ai-sdk.dev/providers/community-providers/codex-cli`
  - `npm view ai-sdk-provider-codex-cli@1.2.2 readme --json`
  - `https://ui.shadcn.com/docs/components/radix/message`
  - `https://ui.shadcn.com/docs/components/radix/message-scroller`

## Observations

- The current server endpoint still emits custom SSE events (`meta`, `delta`, `done`). That does not match the AI SDK 7 UI message stream consumed by `DefaultChatTransport` / `useChat`.
- `@ai-sdk/harness` requires `HarnessAgent` from `@ai-sdk/harness/agent`, not the package root. It also requires a `sandbox` provider in `HarnessAgentSettings`.
- `@ai-sdk/harness-codex` provides `createCodex(settings)`. It supports `auth.openai`, `auth.gateway`, `model`, `reasoningEffort`, `webSearch`, `port`, and `startupTimeoutMs`.
- The supported harness sandbox path is `@ai-sdk/sandbox-vercel` with `createVercelSandbox({ runtime: "node24", ports: [...] })`. This was investigated and then superseded for T-009 by the local Codex CLI subscription-auth backend.
- Harness streaming returns an AI SDK `StreamTextResult`; text must be read from `result.fullStream` parts where `part.type === "text-delta"` and the text is `part.text` or `part.delta`, not `part.textDelta`.
- AI SDK 7 chat transport expects `createUIMessageStream` / `pipeUIMessageStreamToResponse` server output. A deterministic disabled/offline fallback can still use that same stream contract.
- `@ai-sdk/react` v4 `useChat` manages `messages`, `sendMessage`, and `status`, but not textarea input state. The viewer should keep local input state and pass annotations in `sendMessage(..., { body })`.
- Shadcn chat primitives are already installed in the viewer UI. The current `ChatPanel` composes the right visible primitives, but it still hand-parses raw SSE. WS-D should keep the primitives and replace the state/transport layer.
- The community `ai-sdk-provider-codex-cli` package is documented for AI SDK v6 and depends on v6-era provider interfaces. This repo uses `ai@7.0.9`, so importing that provider would add a compatibility risk.
- The actual product goal for T-009 is Codex subscription auth. A direct server-side `codex exec --json` bridge satisfies that goal while keeping the browser contract on AI SDK 7 UI message streams.

## Options Considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Keep current custom SSE and local state | Smallest diff | Does not satisfy AI SDK 7 stream contract or `useChat` requirement | Rejected |
| Use AI SDK UI message stream for both Codex and fallback | One server response contract; works offline; unblocks `useChat` | Requires endpoint refactor and tests | Accepted |
| Require live Codex harness for every viewer chat | Strongest agent integration | Breaks local/offline viewer and requires external sandbox/auth | Rejected |
| Gate local Codex CLI behind `DELANO_VIEWER_CODEX=1` with deterministic fallback | Preserves guarded local viewer behavior while enabling subscription-auth Codex when configured | Makes the expected Codex path feel hidden behind setup ceremony | Superseded by default CLI detection |
| Use `ai-sdk-provider-codex-cli` directly | Uses Codex CLI subscription auth conceptually | Current package is AI SDK v6, while the viewer is on AI SDK 7 | Rejected for T-009 |
| Bridge local `codex exec --json` into AI SDK 7 UI message stream by default when `codex` is available | Uses existing Codex subscription auth and preserves AI SDK 7 client/server stream contract | Server must parse Codex CLI JSONL defensively and keep deterministic fallback for unavailable Codex | Accepted |
| Render chat in a nested drawer inside the annotation drawer | Keeps chat hidden by default | Creates competing scroll regions on tablet | Rejected for the first implementation |
| Render chat as a stable side column inside the existing annotation workspace | Keeps annotations and chat visible together; MessageScroller owns only the conversation scroll | Uses horizontal room on desktop and tablet | Accepted for now |

## Fold-Forward Candidates

| Finding | Target Artifact | Proposed Change |
| --- | --- | --- |
| AI SDK response contract must be `createUIMessageStream` | `T-009` and `.delano/viewer/server.js` | Replace custom SSE with AI SDK UI message stream and fallback chunks |
| Chat client should use `useChat` + `DefaultChatTransport` | `T-010` and `ChatPanel.tsx` | Remove manual `fetch`/SSE parsing and render `messages` from AI SDK state |
| Codex subscription auth should come from local CLI | `docs/viewer-guide.md`, `T-009`, `WS-D` | Document `codex login`, default local CLI detection, unavailable-Codex fallback, and the read-only `codex exec --json` backend |
| Stable side-column placement avoids nested drawer scroll | `T-011` and WS-D | Record responsive placement decision before browser validation |

## Open Questions

- Whether future AI SDK 7 provider packages will expose a native Codex CLI subscription-auth provider. Current T-009 should avoid the AI SDK v6 community provider and keep the CLI bridge small.
- Whether future iterations should add chat-session persistence. Current WS-D can remain ephemeral because annotations are the durable review artifact.
