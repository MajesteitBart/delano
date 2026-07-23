---
name: Viewer Annotations and Agent Handover
slug: 015-delano-viewer-annotations-agent-chat
owner: product
status: complete
created: 2026-06-30T14:08:03Z
updated: 2026-07-01T23:22:07Z
outcome: Delano viewer supports file-scoped annotations, a review panel, and one-click agent handover of annotation bundles for selected .project markdown with explicit write boundaries.
uncertainty: high
probe_required: true
probe_status: pending
probe_decision_rationale: External Plannotator patterns, AI SDK Codex harness integration, and write-boundary changes must be researched before implementation.
operating_mode: uncertain-feature
---

# Spec: Viewer Annotations and Agent Handover

## Executive Summary

Turn the Delano viewer from a read-only contract browser into a guarded review workspace for `.project` markdown. Operators should be able to select text, create annotations, review them in a panel, and hand the bundle over to a coding agent (Codex or Claude Code) that works with the exact file context. Actual file mutation through the viewer must stay explicit: annotations can propose changes, but applying edits to `.project` files through viewer endpoints requires a preview and a user-confirmed write action. The handover agent itself runs in a terminal under its own CLI safety model.

## Problem and Users

Delano already stores specs, plans, workstreams, tasks, context, and progress as markdown contracts, but the viewer only reads and opens those files. Review feedback therefore leaves the viewer through screenshots, chat prose, or raw file edits, which weakens traceability and makes it harder for agents to receive precise, anchored feedback.

Primary users are project operators reviewing Delano contracts, coding agents that need scoped context and feedback, and maintainers who need write-capable tooling without losing Delano's file-based safety model.

## Outcome and Success Metrics

- A reviewer can annotate any visible `.project` markdown document and see those annotations in a persistent drawer.
- Annotation bundles can be copied, downloaded, or handed over to a coding agent as a generated handover file with repo-relative paths, selected quote text, and line or block anchors.
- Agent handover writes a deterministic handover file under `.project/viewer/handovers/` and produces a `codex://new` deep link plus ready-to-run launch or copy commands for Codex or Claude Code without requiring raw prompt stuffing.
- No viewer file write happens without path validation, stale-baseline protection, a visible diff, and an explicit apply action.
- Focused server tests, browser smoke tests, and Delano validation cover the new annotation, handover, and apply boundaries.

## User Stories
- US-001: As an operator, I want to annotate selected text in a Delano markdown file, so that review feedback stays attached to the exact contract content.
- US-002: As an operator, I want an annotation drawer, so that I can scan, edit, delete, and submit feedback without losing my place in the document.
- US-003: As an agent, I want annotation bundles as structured handover files, so that I can reason from source paths, anchors, and comments instead of ambiguous prose.
- US-004: As a maintainer, I want all writes to be reviewed and path-safe, so that "viewer is no longer read-only" does not become unbounded repo mutation.

## Acceptance Scenarios
- AC-001: Given a rendered `.project` markdown document, when a reviewer selects text and creates a comment, then the highlight appears in the document and the drawer lists the annotation with the source path and selected quote.
- AC-002: Given an annotation points at a changed or stale quote, when the document reloads, then the drawer keeps the annotation and marks the inline anchor as stale instead of silently dropping feedback.
- AC-003: Given one or more annotations are selected, when the reviewer triggers handover, then the server writes a handover markdown file with the selected annotations and returns a ready-to-run agent command (terminal launch or clipboard copy).
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
- Guarded handover endpoint that writes annotation handover files and launches or prints Codex/Claude Code commands.
- Work-dispatch handover on task and workstream contracts: start-the-work and review-delivered-work intents from documents and list rows.
- Reviewed apply workflow for turning accepted agent suggestions into file edits.
- Tests and docs for path safety, write boundaries, browser behavior, and rollback.

### Out of Scope

- Replacing Delano's canonical markdown contracts with a database.
- Letting viewer endpoints directly mutate `.project` files without a user-reviewed apply step.
- Embedded in-viewer chat; review conversations happen in the handed-over agent session instead.
- Default Cloudflare or hosted artifact uploads in V1.
- Multi-user real-time collaboration, operational transforms, or cursor presence.
- Full WYSIWYG markdown editing of arbitrary repository files outside `.project`.

## Functional Requirements

- FR-001: Viewer server exposes annotation endpoints for list, create, update, delete, export, and optional draft restore.
- FR-002: Annotation endpoints accept only repo-relative `.project` document paths and store annotation state outside canonical contract markdown until explicitly applied.
- FR-003: Annotation records include `sourcePath`, `quote`, `anchor`, `type`, `comment`, `labels`, `author`, timestamps, and stale-anchor state.
- FR-004: Document rendering exposes stable block or line anchors without breaking existing markdown support for headings, lists, tables, code blocks, task lists, and blockquotes.
- FR-005: Drawer shows all annotations for the active document and can generate deterministic agent-ready markdown and JSON attachments.
- FR-006: Handover endpoint writes a deterministic handover markdown file under `.project/viewer/handovers/` and returns a `codex://new` deep link for the Codex app plus the agent command; terminal launch requires the agent CLI on `PATH` with a copy-command fallback when unavailable.
- FR-007: Handover prompts stay one line and reference the handover file rather than injecting unbounded raw context into the command.
- FR-008: Apply endpoint shows a diff and requires explicit confirmation before writing to `.project` markdown.
- FR-009: All write endpoints enforce payload size limits, path containment, file hash or mtime baselines, and no symlink escape.
- FR-010: Handover supports `start` and `review` intents on task and workstream contracts; these reference the contract path directly and only write a handover file when captured annotations exist to carry as reviewer feedback.

## Non-Functional Requirements

- The default mode must remain safe for local repos: annotate and handover can run without enabling arbitrary viewer writes.
- Public API responses must use repo-relative paths and avoid leaking local absolute paths.
- UI must remain usable on tablet and desktop widths with contents rail, document, and review panel visible or collapsible without overlap.
- Annotation exports and handover files must be deterministic enough for tests and agent reproducibility.
- The feature must degrade cleanly when the Codex or Claude Code CLI is unavailable (copy-command fallback).

## Assumptions
- The initial write-capable surface can be limited to `.project` markdown.
- Annotation storage can be local and repo-scoped before any hosted sharing path is approved.
- Handover launches agents in a terminal under their own CLI safety model; viewer-side file edits still go through Delano's reviewed apply endpoint.
- Existing context-reader profiles remain the correct way to orient agents before deeper implementation work.

## Needs Clarification
- Whether annotation bundles should be committed with project artifacts by default or remain local draft state until explicitly exported.
- Whether Cloudflare sharing should target a Delano-owned endpoint, a user-provided endpoint, or stay copy/download-only for V1.
- Which Shadcn/Radix primitives should be added next as the viewer app grows beyond annotation and handover.

## Hypotheses and Unknowns

- A quote-plus-block/line anchor model should be sufficient for Delano contract review because markdown documents change less often than source code.
- Durable Shadcn Chat integration requires the viewer client to be built as a Vite/Shadcn app instead of editing static in-browser React files.
- Local Codex CLI chat can replace one-off deeplink prompts for in-view question answering, but write actions still need Delano-specific confirmation.

## Touchpoints to Exercise

- `.delano/viewer/server.js`
- `.delano/viewer/ui/src/App.tsx`
- `.delano/viewer/ui/src/index.css`
- `.delano/viewer/public/assets/viewer.js`
- `.delano/viewer/public/assets/index.css`
- `test/viewer-server.test.js`
- `src/cli/lib/context-reader.js`
- `docs/cli-reference.md`
- `docs/user-guide.md`
- `assets/install-manifest.json`
- `assets/payload/`

## Probe Findings

- Plannotator separates reusable annotation types/store logic from server transport, then streams snapshots and mutations over SSE with polling fallback. This is a good model for Delano, but Delano should constrain writes to `.project` and keep source paths repo-relative.
- Plannotator's annotation drawer and export modal prove the desired UX shape: sorted feedback cards, count badges, copy/download, and agent-wrapped markdown.
- AI SDK's Codex harness is available through `@ai-sdk/harness-codex`, `codex`, and `createCodex`, but T-009 uses the local Codex CLI subscription-auth path because the requested community Codex CLI provider is documented for AI SDK v6 and this project uses AI SDK 7.
- Shadcn's message scroller provides anchored streaming chat behavior that matches the requested drawer/chat experience.

## Footguns Discovered

- The current viewer is explicitly described and tested as read-only, so this project must rename the mode boundaries rather than quietly adding writes.
- `dangerouslySetInnerHTML` markdown rendering makes browser selection easy but anchor metadata fragile unless rendered blocks get stable identifiers.
- Hosted sharing via Cloudflare-like paste services introduces privacy, retention, and size-limit decisions; it should not be the first write milestone.
- Codex chat must not be treated as an apply mechanism; permissions and writes need a separate Delano gate.

## Remaining Unknowns

- Best long-term storage path for annotation bundles.
- Whether stable anchors should use markdown source line ranges, rendered block ids, text quote selectors, or a hybrid.
- How much of the remaining markdown renderer should move from local rendering helpers to shared viewer components.

## Dependencies

- Plannotator source research from `https://github.com/backnotprop/plannotator/tree/main/packages`.
- AI SDK Codex harness documentation at `https://ai-sdk.dev/providers/ai-sdk-harnesses/codex` and community Codex CLI provider documentation at `https://ai-sdk.dev/providers/community-providers/codex-cli`.
- Shadcn/Radix docs for Message Scroller, Marker, Attachment, Bubble, and Message components.
- Existing Delano context reader and viewer indexing behavior.

## Approval Notes

- 2026-06-30T22:20:23Z: Reopened to add a follow-up workstream for real AI SDK 7 chat using shadcn Message and MessageScroller primitives.
- 2026-07-01T01:24:39+02:00: Folded forward the T-009 correction: Codex auth comes from the local Codex CLI subscription login and the server bridges `codex exec --json` into the AI SDK 7 UI message stream.
- 2026-07-01T21:40:31Z: Owner review rejected embedded chat as flimsy and cluttered. Pivoted the review output to agent handover (handover files plus Codex/Claude Code launch or copy commands), removed the chat surface and AI SDK dependencies, made annotation popovers sticky with click-to-edit highlights, and redesigned the reader with a contents rail and per-document sidebar navigation. See decisions.md and T-013.

- Research is complete enough to plan. Implementation should start with storage/write boundaries before UI polish or hosted sharing.
