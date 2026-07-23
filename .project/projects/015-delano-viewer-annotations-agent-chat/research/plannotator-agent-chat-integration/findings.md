---
type: research_findings
project: 015-delano-viewer-annotations-agent-chat
slug: plannotator-agent-chat-integration
created: 2026-06-30T14:08:10Z
updated: 2026-06-30T14:22:00Z
---

# Findings: Plannotator-style annotations and agent chat integration

## Source References

- Plannotator package tree: `https://github.com/backnotprop/plannotator/tree/main/packages`
- Plannotator annotation model/store: `packages/shared/external-annotation.ts`
- Plannotator annotation HTTP transport: `packages/server/external-annotations.ts`
- Plannotator viewer selection/highlighting: `packages/ui/hooks/useAnnotationHighlighter.ts`
- Plannotator external annotation subscription: `packages/ui/hooks/useExternalAnnotations.ts`
- Plannotator drawer/export surfaces: `packages/ui/components/AnnotationSidebar.tsx`, `packages/ui/components/ExportModal.tsx`, `packages/review-editor/utils/exportFeedback.ts`
- Plannotator AI session/chat endpoints: `packages/ai/endpoints.ts`, `packages/ai/context.ts`, `packages/ai/providers/codex-app-server.ts`, `packages/ui/hooks/useAIChat.ts`, `packages/ui/components/ai/DocumentAIChatPanel.tsx`
- Current Delano viewer: `.delano/viewer/server.js`, `.delano/viewer/public/app.jsx`, `.delano/viewer/public/styles.css`, `test/viewer-server.test.js`
- AI SDK Codex harness docs: `https://ai-sdk.dev/providers/ai-sdk-harnesses/codex`
- Shadcn/Radix docs: `https://ui.shadcn.com/docs/components/radix/message-scroller`, `https://ui.shadcn.com/docs/components/radix/marker`, `https://ui.shadcn.com/docs/components/radix/attachment`, `https://ui.shadcn.com/docs/components/radix/bubble`, `https://ui.shadcn.com/docs/components/radix/message`

## Observations

- Plannotator's annotation core is separated cleanly: shared validation/store logic accepts single or batch annotation objects, validates plan/review shapes, assigns IDs, and emits mutation events. Delano should mirror the separation, but with stricter `.project` path containment and repo-relative output.
- Plannotator streams annotation changes over `/api/external-annotations/stream` with GET snapshot, POST add, PATCH update, DELETE by id/source/all, and heartbeat support. Delano can start with snapshot plus mutation endpoints and add SSE only when live multi-pane sync is needed.
- Plannotator's plan annotation shape supports comments, deletions, global comments, original selected text, author, source, and image attachments. Delano should simplify the first version to comment/label/global plus quote and anchor metadata; deletion should remain a suggested change until apply is implemented.
- Plannotator's `useAnnotationHighlighter` restores highlights from selected text with normalized fallback. Delano needs the same stale-friendly behavior because markdown line/block anchors will drift as specs/tasks are edited.
- Plannotator's drawer/export UX is close to the target: sorted annotation cards, count badge, delete/select behavior, copy/download, and agent-wrapped feedback markdown.
- The current Delano viewer renders markdown as HTML strings and advertises read-only behavior in server comments, console output, and page footers. Any write feature needs explicit mode language and tests that prove writes are bounded.
- AI SDK Codex harness docs show installation through `@ai-sdk/harness`, `@ai-sdk/harness-codex`, and `@ai-sdk/sandbox-vercel`; examples import `codex` and `createCodex`, create a `HarnessAgent`, create a session, and stream result parts. This is a better implementation target than maintaining only URL deeplinks for in-view chat.
- Shadcn Message Scroller provides the requested streaming behavior: provider, viewport, content, item anchoring, button, `autoScroll`, and `aria-busy` support. The current viewer may need a build step or a local component port to use these components well.
- Plannotator's Cloudflare-like paste/share path compresses annotation payloads and can upload encrypted data to a paste service, but that has separate privacy, retention, size, and hosting implications for Delano.

## Options Considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Keep viewer read-only and only add copyable prompt bundles | Lowest risk; aligns with current viewer | Does not meet the user's goal of annotations and connected agents | Rejected |
| Add local annotation JSON plus drawer/export/chat attachments | Meets core workflow; preserves `.project` markdown safety; testable locally | Requires new write endpoints and anchor model | Accepted |
| Directly edit markdown from annotations/chat | Powerful and simple mental model | High risk; agents could mutate contracts without review; stale edits likely | Rejected for V1 |
| Reviewed apply workflow after annotations/chat | Makes viewer writable while preserving confirmation and diffs | More work; needs baseline/hash checks | Accepted as gated milestone |
| Cloudflare-style sharing in V1 | Nice sharing flow; matches Plannotator inspiration | Remote data handling and hosting decisions are unresolved | Deferred to optional workstream task |
| Migrate viewer fully to a bundled Shadcn app first | Clean component integration | Larger platform shift before the workflow is proven | Keep as implementation decision before T-004 |

## Fold-Forward Candidates

| Finding | Target Artifact | Proposed Change |
| --- | --- | --- |
| Annotation store must be separate from canonical markdown | `spec.md`, `plan.md`, `decisions.md`, `T-001` | Require repo-relative annotation JSON and safe write endpoints before UI. |
| Drawer/export is the core UX surface | `spec.md`, `plan.md`, `WS-B`, `T-003` | Add drawer, deterministic markdown/JSON export, and tablet/desktop layout checks. |
| Codex chat should use AI SDK harness | `spec.md`, `plan.md`, `WS-C`, `T-004` | Add AI SDK Codex harness endpoint and message-scroller UI with attachments. |
| File edits need review/apply gate | `spec.md`, `plan.md`, `decisions.md`, `T-005` | Require diff preview, stale baseline checks, explicit apply, and rollback evidence. |
| Hosted sharing is useful but optional | `spec.md`, `plan.md`, `decisions.md`, `T-006` | Defer Cloudflare artifact path behind a privacy/retention decision. |

## Open Questions

- Should annotation JSON be committed by default or remain local draft state until exported?
- Should the viewer adopt a build step before Shadcn Chat implementation?
- Which remote sharing backend, if any, should Delano support?
- What exact anchor tuple best balances line precision, markdown parser complexity, and stale-feedback resilience?
