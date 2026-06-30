---
name: Viewer Annotations and Agent Chat
status: planned
lead: product
created: 2026-06-30T14:08:03Z
updated: 2026-06-30T14:20:00Z
linear_project_id:
risk_level: high
spec_status_at_plan_time: planned
operating_mode: uncertain-feature
---

# Delivery Plan: Viewer Annotations and Agent Chat

## What Changed After Probe

Research narrowed the project from "make the viewer writable" to four gated capabilities: local annotations, a drawer/export surface, Codex chat attachments, and reviewed apply. Cloudflare-style sharing remains optional because it changes privacy and hosting assumptions.

## Technical Context

The current Delano viewer is a Node `http` server with static React/Babel assets. It serves `.project` markdown through `/api/index`, `/api/doc`, and `/api/open`; existing viewer tests assert the read-only banner/logging and API behavior. The markdown reader currently renders HTML strings through `dangerouslySetInnerHTML`, which means annotation support needs either stable rendered block wrappers or a parser-level refactor before reliable anchor restoration.

Plannotator offers useful patterns but should not be copied wholesale. Its relevant pieces are:

- `packages/shared/external-annotation.ts`: typed annotation validation, store mutation events, and SSE serialization.
- `packages/server/external-annotations.ts`: thin HTTP transport with snapshot, add, update, delete, clear, and SSE routes.
- `packages/ui/hooks/useAnnotationHighlighter.ts`: text selection, toolbar state, quote restoration, and stale-friendly matching.
- `packages/ui/components/AnnotationSidebar.tsx` and `ExportModal.tsx`: drawer and copy/download/export UX.
- `packages/ai/endpoints.ts` and `packages/ai/providers/codex-app-server.ts`: session, query, abort, permission, and Codex app-server safety patterns.

External docs confirm the requested implementation direction: AI SDK Codex harness is installed via `@ai-sdk/harness`, `@ai-sdk/harness-codex`, and `@ai-sdk/sandbox-vercel`, and exposes `codex`/`createCodex`; Shadcn Message Scroller supports anchored streaming chat with `MessageScrollerProvider`, `MessageScrollerViewport`, `MessageScrollerContent`, `MessageScrollerItem`, and `MessageScrollerButton`.

## Architecture Decisions

- Keep canonical `.project` markdown as the source of truth. Annotation records live beside the contracts until a user explicitly applies a change.
- Store annotations in repo-relative, path-validated JSON. Do not embed annotation comments into markdown frontmatter or bodies in V1.
- Use a hybrid anchor: repo-relative `sourcePath`, source line or rendered block id when available, selected quote text, and a normalized text selector fallback.
- Add write endpoints only for annotation state first. Later file-apply endpoints must require a diff preview, stale-baseline check, and explicit apply confirmation.
- Implement Codex chat as a separate endpoint from file apply. The chat response may propose edits but cannot write files directly.
- Treat Cloudflare sharing as a feature flag/follow-up after privacy and retention decisions.

## Policy and Contract Checks
- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map
- `spec.md`: Created by `delano project create`, then folded forward from research.
- `plan.md`: Created by `delano project create`, then folded forward from research.
- `decisions.md`: Created by `delano project create`, then updated with accepted architecture decisions.
- `research/plannotator-agent-chat-integration/`: Created by `delano research` and used as the evidence record.
- `workstreams/`: Created by `delano workstream add`.
- `tasks/`: Created by `delano task add`.

## Complexity Exceptions
- Viewer write capability is a high-risk feature because it changes a read-only tool into a local mutation surface. The plan keeps write scopes separate: annotation JSON writes first, markdown apply writes only after preview and confirmation.

## Probe-Driven Architecture Changes

- Use Plannotator-style annotation event/store concepts, but constrain Delano persistence and paths.
- Use AI SDK Codex harness for chat transport instead of extending deeplink-only agent buttons.
- Prefer local annotation export and chat attachments before remote sharing.

## Workstream Design

- `WS-A Annotation Data and Write Boundaries`: owns data model, path-safe endpoints, draft persistence, and reviewed file-apply workflow.
- `WS-B Viewer Annotation Drawer UX`: owns rendered markdown anchors, selection toolbar, inline highlights, drawer behavior, and export surface.
- `WS-C Codex Chat and Attachment Flow`: owns chat endpoint, AI SDK Codex harness integration, Shadcn Chat component usage, optional sharing evaluation, and docs.

## Milestone Strategy

1. Land the annotation storage contract and safety tests.
2. Make the markdown reader annotation-aware with drawer UX and export.
3. Add Codex-backed chat submission for annotation attachments.
4. Add reviewed apply workflow for accepted changes.
5. Evaluate hosted sharing only after local flows are stable.

## Rollout Strategy

- Keep annotation mode disabled unless the local viewer server supports the required write endpoints.
- Preserve read-only viewing as the fallback when annotation storage or Codex dependencies are unavailable.
- Gate file-apply behind a separate confirmation flow and expose clear mode labels: view, annotate, chat, apply.
- Rebuild `assets/payload` only when runtime files change.

## Test Strategy

- Unit tests for annotation payload validation, path containment, symlink escape rejection, stale baseline rejection, and export formatting.
- Viewer server tests for `/api/annotations`, `/api/annotations/export`, `/api/ai/*`, and reviewed apply endpoints.
- Browser smoke tests for selection toolbar, drawer list/select/delete, stale-anchor marker, chat attachment submission, streaming scroll behavior, and tablet layout.
- Package validation: `npm test`, `npm run build:assets`, `npm run check:package-manifest`, and `node bin/delano.js validate`.

## Rollback Strategy

- Annotation JSON can be deleted without modifying canonical `.project` contracts.
- Runtime rollback reverts `.delano/viewer` and associated server tests.
- If apply writes fail or produce undesired edits, revert the generated git diff for the affected `.project` files and keep annotation export as evidence.

## Remaining Delivery Risks

- The viewer may need a build step to use Shadcn Chat components cleanly.
- Quote-based anchors can become stale after markdown edits; stale UI must be deliberate, not silent.
- Codex harness availability and authentication vary by environment.
- Hosted sharing needs a separate security and privacy decision before implementation.
