---
name: Viewer Annotations and Agent Chat
slug: delano-viewer-annotations-agent-chat
owner: product
status: planned
created: 2026-06-30T14:08:03Z
updated: 2026-06-30T14:20:00Z
outcome: Delano viewer supports file-scoped annotations, an annotation drawer, and agent chat submissions for selected .project markdown with explicit write boundaries.
uncertainty: high
probe_required: true
probe_status: pending
probe_decision_rationale: External Plannotator patterns, AI SDK Codex harness integration, and write-boundary changes must be researched before implementation.
operating_mode: uncertain-feature
---

# Spec: Viewer Annotations and Agent Chat

## Executive Summary

Turn the Delano viewer from a read-only contract browser into a guarded review workspace for `.project` markdown. Operators should be able to select text, create annotations, review them in a drawer, export or attach them to an agent chat, and ask a Codex-backed assistant to reason over the exact file context. Actual file mutation must stay explicit: annotations and chat responses can propose changes, but applying edits to `.project` files requires a preview and a user-confirmed write action.

## Problem and Users

Delano already stores specs, plans, workstreams, tasks, context, and progress as markdown contracts, but the viewer only reads and opens those files. Review feedback therefore leaves the viewer through screenshots, chat prose, or raw file edits, which weakens traceability and makes it harder for agents to receive precise, anchored feedback.

Primary users are project operators reviewing Delano contracts, coding agents that need scoped context and feedback, and maintainers who need write-capable tooling without losing Delano's file-based safety model.

## Outcome and Success Metrics

- A reviewer can annotate any visible `.project` markdown document and see those annotations in a persistent drawer.
- Annotation bundles can be copied, downloaded, or submitted to a chat as structured attachments with repo-relative paths, selected quote text, and line or block anchors.
- Codex-backed chat can answer against the current document, selected annotations, and `delano context read` profile guidance without requiring raw prompt stuffing.
- No file write happens without path validation, stale-baseline protection, a visible diff, and an explicit apply action.
- Focused server tests, browser smoke tests, and Delano validation cover the new annotation, chat, and apply boundaries.

## User Stories
- US-001: As an operator, I want to annotate selected text in a Delano markdown file, so that review feedback stays attached to the exact contract content.
- US-002: As an operator, I want an annotation drawer, so that I can scan, edit, delete, and submit feedback without losing my place in the document.
- US-003: As an agent, I want annotation bundles as structured chat attachments, so that I can reason from source paths, anchors, and comments instead of ambiguous prose.
- US-004: As a maintainer, I want all writes to be reviewed and path-safe, so that "viewer is no longer read-only" does not become unbounded repo mutation.

## Acceptance Scenarios
- AC-001: Given a rendered `.project` markdown document, when a reviewer selects text and creates a comment, then the highlight appears in the document and the drawer lists the annotation with the source path and selected quote.
- AC-002: Given an annotation points at a changed or stale quote, when the document reloads, then the drawer keeps the annotation and marks the inline anchor as stale instead of silently dropping feedback.
- AC-003: Given one or more annotations are selected, when the reviewer sends them through chat, then the chat request includes structured attachments and the streamed response renders in a stable message scroller.
- AC-004: Given Codex proposes a file edit, when the reviewer chooses to apply it, then the viewer shows a diff, checks the current file baseline, and writes only after explicit confirmation.
- AC-005: Given a malicious request uses an absolute path, traversal segment, symlink escape, unknown project document, or oversized payload, when it reaches a viewer endpoint, then the request is rejected and no file is written.
- AC-006: Given sharing is enabled later, when an annotation bundle is exported remotely, then the payload is bounded, privacy-reviewed, encrypted or otherwise explicitly protected, and local copy/download remains available when sharing is disabled.

## Scope
### In Scope

- Annotation data model for `.project` markdown documents.
- Local persistence for annotation drafts/bundles under a constrained project-owned store.
- Viewer selection capture, inline highlights, quick labels, comment creation, and stale-anchor handling.
- A right-side annotation drawer with count badges, edit/delete/select behavior, and export actions.
- Agent-ready markdown/JSON export of annotations.
- AI SDK Codex harness chat endpoint and UI flow for sending document/annotation attachments.
- Reviewed apply workflow for turning accepted agent suggestions into file edits.
- Tests and docs for path safety, write boundaries, browser behavior, and rollback.

### Out of Scope

- Replacing Delano's canonical markdown contracts with a database.
- Letting chat or agents directly mutate `.project` files without a user-reviewed apply step.
- Default Cloudflare or hosted artifact uploads in V1.
- Multi-user real-time collaboration, operational transforms, or cursor presence.
- Full WYSIWYG markdown editing of arbitrary repository files outside `.project`.

## Functional Requirements

- FR-001: Viewer server exposes annotation endpoints for list, create, update, delete, export, and optional draft restore.
- FR-002: Annotation endpoints accept only repo-relative `.project` document paths and store annotation state outside canonical contract markdown until explicitly applied.
- FR-003: Annotation records include `sourcePath`, `quote`, `anchor`, `type`, `comment`, `labels`, `author`, timestamps, and stale-anchor state.
- FR-004: Document rendering exposes stable block or line anchors without breaking existing markdown support for headings, lists, tables, code blocks, task lists, and blockquotes.
- FR-005: Drawer shows all annotations for the active document and can generate deterministic agent-ready markdown and JSON attachments.
- FR-006: Chat endpoint uses the AI SDK Codex harness and streams responses to the viewer.
- FR-007: Chat submissions include selected annotations as attachments rather than injecting unbounded raw context into the prompt.
- FR-008: Apply endpoint shows a diff and requires explicit confirmation before writing to `.project` markdown.
- FR-009: All write endpoints enforce payload size limits, path containment, file hash or mtime baselines, and no symlink escape.

## Non-Functional Requirements

- The default mode must remain safe for local repos: annotate and chat can run without enabling arbitrary writes.
- Public API responses must use repo-relative paths and avoid leaking local absolute paths.
- UI must remain usable on tablet and desktop widths with content, drawer, and chat visible or collapsible without overlap.
- Annotation exports must be deterministic enough for tests and agent reproducibility.
- The feature must degrade cleanly when Codex or AI SDK dependencies are unavailable.

## Assumptions
- The initial write-capable surface can be limited to `.project` markdown.
- Annotation storage can be local and repo-scoped before any hosted sharing path is approved.
- Codex chat should start in a read-only/default sandbox posture; file edits go through Delano's reviewed apply endpoint.
- Existing context-reader profiles remain the correct way to orient agents before deeper implementation work.

## Needs Clarification
- Whether annotation bundles should be committed with project artifacts by default or remain local draft state until explicitly exported.
- Whether Cloudflare sharing should target a Delano-owned endpoint, a user-provided endpoint, or stay copy/download-only for V1.
- Which Shadcn/Radix primitives should be vendored versus used through a future app-stack migration.

## Hypotheses and Unknowns

- A quote-plus-block/line anchor model should be sufficient for Delano contract review because markdown documents change less often than source code.
- The current Babel-in-browser viewer can support a focused prototype, but durable Shadcn Chat integration may justify a build step or viewer app stack change.
- AI SDK Codex harness can replace one-off deeplink prompts for in-view question answering, but write actions still need Delano-specific confirmation.

## Touchpoints to Exercise

- `.delano/viewer/server.js`
- `.delano/viewer/public/app.jsx`
- `.delano/viewer/public/styles.css`
- `test/viewer-server.test.js`
- `src/cli/lib/context-reader.js`
- `docs/cli-reference.md`
- `docs/user-guide.md`
- `assets/install-manifest.json`
- `assets/payload/`

## Probe Findings

- Plannotator separates reusable annotation types/store logic from server transport, then streams snapshots and mutations over SSE with polling fallback. This is a good model for Delano, but Delano should constrain writes to `.project` and keep source paths repo-relative.
- Plannotator's annotation drawer and export modal prove the desired UX shape: sorted feedback cards, count badges, copy/download, and agent-wrapped markdown.
- AI SDK's Codex harness is available through `@ai-sdk/harness-codex`, `codex`, and `createCodex`; basic usage creates a `HarnessAgent`, session, and streamed response.
- Shadcn's message scroller provides anchored streaming chat behavior that matches the requested drawer/chat experience.

## Footguns Discovered

- The current viewer is explicitly described and tested as read-only, so this project must rename the mode boundaries rather than quietly adding writes.
- `dangerouslySetInnerHTML` markdown rendering makes browser selection easy but anchor metadata fragile unless rendered blocks get stable identifiers.
- Hosted sharing via Cloudflare-like paste services introduces privacy, retention, and size-limit decisions; it should not be the first write milestone.
- Codex chat must not be treated as an apply mechanism; permissions and writes need a separate Delano gate.

## Remaining Unknowns

- Best long-term storage path for annotation bundles.
- Whether stable anchors should use markdown source line ranges, rendered block ids, text quote selectors, or a hybrid.
- Whether the viewer should migrate from Babel standalone to a bundled React/Shadcn app before implementation.

## Dependencies

- Plannotator source research from `https://github.com/backnotprop/plannotator/tree/main/packages`.
- AI SDK Codex harness documentation at `https://ai-sdk.dev/providers/ai-sdk-harnesses/codex`.
- Shadcn/Radix docs for Message Scroller, Marker, Attachment, Bubble, and Message components.
- Existing Delano context reader and viewer indexing behavior.

## Approval Notes

- Research is complete enough to plan. Implementation should start with storage/write boundaries before UI polish or hosted sharing.
