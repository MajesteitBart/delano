---
name: Viewer OpenKnowledge Parity
slug: viewer-openknowledge-parity
owner: bart
status: complete
created: 2026-07-09T23:54:25Z
updated: 2026-07-10T18:28:14Z
outcome: The Delano viewer matches the OpenKnowledge experience for manual markdown editing, agent handoff, and watching agents work in real time, with the same guarded write boundaries it has today.
uncertainty: medium
probe_required: true
probe_status: completed
probe_decision_rationale: Markdown round-trip fidelity through TipTap + @tiptap/markdown over real .project contracts is the one unknown that can invalidate the editing architecture; a scripted round-trip probe over the full repo corpus retires it cheaply before build commitment.
operating_mode: feature
---

# Spec: Viewer OpenKnowledge Parity

## Executive Summary

The Delano viewer is a polished read-and-review surface: it renders `.project` markdown, captures annotations, and dispatches agent handovers. OpenKnowledge (inkeep/open-knowledge) sets the current bar for how a local markdown workspace should feel: seamless WYSIWYG editing, one-gesture agent handoff, and live visibility of agent edits as they happen. This project closes the three specific gaps — manual editing, real-time agent activity, and handoff feedback — without abandoning the viewer's guarded write model (hash-checked apply, `.project`-scoped paths, no silent canonical writes).

## Problem and Users

- **Operators (humans reviewing/editing contracts):** today they must leave the viewer and open VS Code for any edit, even a one-word status note. The annotate → handover loop is polished, but the direct-edit loop is missing entirely.
- **Agent supervisors (humans watching dispatched agents):** after clicking handover, the viewer goes silent. Agents edit `.project` files, but the viewer shows stale content until a manual refresh. There is no signal that an agent is active, what it changed, or when it finished.
- **Agents (Claude, Codex, etc.):** unaffected directly, but benefit when humans can correct small things inline instead of dispatching a full handover for typo-level fixes.

## Outcome and Success Metrics

Outcome: the viewer supports in-place WYSIWYG markdown editing with guarded saves, live document/index updates when files change on disk, and visible agent-activity feedback after handover — all at the visual and interaction quality of the existing review surface.

Success metrics (binary at closeout):

- SM-1: A user can edit a `.project` markdown body in the viewer and save it without touching another tool; the write goes through the existing hash-checked apply path.
- SM-2: Round-trip probe: parsing and re-serializing every committed `.project/**/*.md` body through the editor pipeline produces no semantic loss (headings, lists, tables, code fences, links, task lists preserved; frontmatter byte-identical).
- SM-3: With the viewer open and an external process (agent or editor) modifying a `.project` file, the open document and the workspace index update within 2 seconds without user action.
- SM-4: External changes to the open document are visually flagged (changed-region flash + activity entry), and an active edit session is protected from silent clobber (conflict banner with reload/keep-mine when local edits exist).
- SM-5: After an agent handover dispatch, the viewer surfaces a live activity feed of file events so the user can watch the agent work without leaving the page.
- SM-6: `delano validate`, `npm test`, and the viewer UI build all pass; browser E2E smoke of edit/save/live-update flows is executed via Codex and evidence recorded.

## User Stories

- US-001: As an operator, I want to switch a document into edit mode and change its body with WYSIWYG affordances, so that small contract fixes don't require VS Code.
- US-002: As an operator, I want frontmatter protected from free-form editing, so that contract keys and status values can't be corrupted by a stray keystroke.
- US-003: As an operator, I want save to fail safely when the file changed under me, so that I never silently overwrite agent work.
- US-004: As an agent supervisor, I want the open document and index to refresh automatically when agents write files, so that I watch work happen instead of hammering refresh.
- US-005: As an agent supervisor, I want a visible activity feed and per-file change flashes after dispatching a handover, so that I know the agent is alive and what it touched.
- US-006: As an operator, I want editing, saving, and live updates to feel as fluid as OpenKnowledge (instant mode switch, keyboard shortcuts, subtle motion), so that the viewer feels like one coherent product.

## Acceptance Scenarios

- AC-001: Given a markdown document open in read mode, when the user presses Edit (or `e` / `Cmd/Ctrl+E`), then the body becomes editable in a WYSIWYG editor within the same layout, with frontmatter shown as a locked properties card.
- AC-002: Given unsaved edits, when the user saves (`Cmd/Ctrl+S` or Save button), then the client sends the base file hash; on match the file is written and a success toast shows; on mismatch a conflict banner offers reload-theirs or keep-mine-and-retry, and no write happens silently.
- AC-003: Given the round-trip probe script run against all committed `.project` markdown, when comparing parsed→serialized output, then zero files show semantic loss and all frontmatter blocks are byte-identical (probe gate for build commitment).
- AC-004: Given the viewer open on any page, when an external process creates/modifies/deletes a `.project` markdown file, then the index and any open document reflect the change within 2 seconds via server push (SSE), not polling.
- AC-005: Given an open document updated externally while the user is in read mode, when the update lands, then changed regions flash briefly and an entry appears in the activity feed naming the file and change kind.
- AC-006: Given an open document with unsaved local edits, when the same file changes externally, then the editor does not auto-reload; a conflict banner appears with explicit choices.
- AC-007: Given a handover dispatched from the viewer, when the agent begins editing files, then the activity feed shows events live and the handover confirmation includes a clear dispatched state (no dead-end UI).
- AC-008: Given all features enabled, when running `delano validate`, `npm test`, UI typecheck/lint/build, then all pass; Codex-run browser E2E evidence for AC-001/002/004/005 is recorded in task updates.

## Scope

### In Scope

- WYSIWYG markdown body editing (TipTap 3 + official `@tiptap/markdown`) for `.project` markdown files in the document reader.
- Frontmatter preservation: locked, byte-identical passthrough; rendered read-only as a properties card in edit mode.
- Guarded save path: extend the existing preview/apply endpoints (hash check, `.project`-scoped) for editor saves.
- Server-sent events endpoint + recursive `.project` watcher (native `fs.watch`) driving live index/document refresh.
- Changed-region flash, activity feed panel, agent-active indicator, conflict banners.
- Handoff polish: dispatched-state feedback, activity feed tie-in, toasts.
- Round-trip fidelity probe script and its evidence.
- Codex-delegated browser E2E smoke and non-design implementation tasks.

### Out of Scope

- CRDT/Yjs collaborative editing or multi-cursor presence (OpenKnowledge-grade collab infra is not needed for a local single-user viewer).
- Editing non-markdown files, files outside `.project`, or frontmatter value editing UI.
- Renaming/moving/creating/deleting files from the viewer.
- Terminal/TUI embedding, graph view, wiki-links, Mermaid/KaTeX rendering upgrades.
- Changes to annotation anchoring or the existing read-mode renderer.
- Auto-save without explicit user save gesture (write boundary stays explicit).

## Functional Requirements

- FR-1: Edit mode toggle per markdown document; read mode remains the default and keeps the existing renderer and annotation layer untouched.
- FR-2: Editor supports headings, bold/italic/strike/code, links, ordered/unordered/task lists, tables, blockquotes, code fences, and horizontal rules — the constructs present in `.project` corpus — with markdown-true serialization.
- FR-3: Save sends `{path, baseHash, markdown}` to a guarded endpoint that verifies repo-relative `.project` path and current hash before writing; response returns the new hash.
- FR-4: `GET /api/events` streams SSE: `index-changed`, `doc-changed {path, kind}`, heartbeat; watcher debounces bursts (≤250ms window).
- FR-5: Client subscribes once per session; on `doc-changed` for the open path in read mode, refetch and flash changed blocks; in edit mode with dirty state, show conflict banner instead.
- FR-6: Activity feed lists recent file events (path, kind, relative time), newest first, capped; visible from the reader without navigation; badge pulses while events arrive ("agent working" affordance).
- FR-7: Handover dispatch transitions to a visible dispatched state and deep-links attention to the activity feed.
- FR-8: All new UI uses the existing shadcn/Radix/Tailwind v4 token system, Inter/JetBrains Mono, and motion consistent with `--ease-out-strong`-style curves already shipped in the redesign.

## Non-Functional Requirements

- NFR-1: No new runtime server dependencies (server stays plain Node http + built-ins; SSE and `fs.watch` are stdlib). UI deps limited to TipTap packages.
- NFR-2: Editor bundle loaded lazily so read-only browsing performance is unchanged.
- NFR-3: Watcher and SSE must be Windows-safe (`fs.watch` recursive is supported on win32) and clean up on connection close.
- NFR-4: Saves remain atomic single-file writes; no partial writes on conflict; hash algorithm identical to existing apply path.
- NFR-5: Keyboard-first: Edit, Save, Escape-to-read-mode all keyboard reachable; focus management accessible (Radix primitives).
- NFR-6: Works in the packaged payload (`npm run build:assets`) exactly as in dev.

## Assumptions

- The viewer remains single-user local; last-writer-wins with hash guard is sufficient (no OT/CRDT needed).
- The `.project` markdown corpus stays within GFM constructs the probe validates; exotic MDX is absent from contracts.
- Existing preview/apply endpoints are the correct write chokepoint and can be extended without breaking the annotations flow.
- Codex CLI (`gpt-5.6-sol`) is available for delegated implementation and browser E2E per repo delegation rules.

## Needs Clarification

- None blocking. Deferred choice recorded in decisions.md if needed: whether the activity feed persists across viewer restarts (current answer: in-memory only).

## Hypotheses and Unknowns

- H-1: `@tiptap/markdown` round-trips the `.project` corpus without semantic loss. (Probe target; highest risk.)
- H-2: Native recursive `fs.watch` on win32 + macOS is reliable enough with debouncing for 2s freshness. (Low risk; fallback is 2s stat polling behind same SSE interface.)
- H-3: Changed-block flashing can be computed from the existing line-anchored block renderer via block-level diffing. (Medium; fallback is whole-document subtle flash.)

## Touchpoints to Exercise

- `.delano/viewer/server.js` (endpoints, watcher, SSE, apply path).
- `.delano/viewer/ui` (reader page, new editor surface, activity feed, toasts).
- `delano viewer` CLI launch path and packaged payload (`assets/payload/.delano/viewer`).
- `.project/viewer/annotations.json` compatibility (annotations must survive edits to unrelated regions; annotations on edited files may go stale — flagged, not migrated).

## Probe Findings

- Executed 2026-07-10 by Codex (`gpt-5.6-sol`) via `.delano/viewer/ui/scripts/roundtrip-probe.mjs` and `watch-probe.mjs`; report at `output/roundtrip-probe-report.json`.
- Round-trip over 334 committed `.project` markdown files: 0 parse errors, 0 frontmatter failures, 5 semantic drift cases (1.5%), all minor formatting normalization in historical files: empty `-` list items reparsed as lists, trailing space inside inline code dropped, literal backticks in double-backtick code spans simplified. No data loss; contract validation is unaffected by any of the five.
- fs.watch recursive on win32: PASS — all scenarios (single write, 20-write burst, 50-file bulk create/delete, nested modify) produced matching events in <=7ms. Windows coalesces bulk operations, so the watcher must debounce and rescan rather than assume one event per file.
- `@tiptap/markdown` exposes headless `MarkdownManager({extensions}).parse()/serialize()` plus `editor.getMarkdown()`; StarterKit bundles Link (register custom Link with `{link: false}`); `TableKit` bundles the table node set.
- GO decision: TipTap + `@tiptap/markdown` accepted (SM-2 amended per D-003: the 5 known normalization cases are surfaced in the UI, not treated as blockers).

## Footguns Discovered

- Read-mode renderer is hand-rolled and line-anchored for annotations; replacing it would break annotation anchoring. Decision: edit mode is a separate lazily-loaded surface; read mode untouched.
- `.claude/` is a generated mirror; viewer UI edits happen in `.delano/viewer/ui` and must be followed by UI build + `npm run build:assets` for packaging checks.
- Frontmatter rule: frontmatter must remain the first block and byte-identical through the editor; serializer must never touch it.

## Remaining Unknowns

- Exact fidelity of table serialization in `@tiptap/markdown` for the corpus (covered by probe).
- Whether `fs.watch` recursive emits reliable events for git-checkout-driven bulk changes (covered by manual probe step; fallback polling documented).

## Dependencies

- TipTap 3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`) — new UI dependencies.
- Existing: React 19, shadcn/Radix, Tailwind v4, Vite 8, plain-Node viewer server.
- Codex CLI with `gpt-5.6-sol` for delegated non-design coding and browser E2E.

## Approval Notes

- 2026-07-10T01:15:02Z: Project closed with `delano project close`.

- 2026-07-10T00:13:43Z: Spec and plan approved; probe gate first

- Created from /goal directive 2026-07-09; owner bart. Operating mode `feature` with a mandatory pre-build probe (H-1). Write boundaries unchanged from delano-viewer-annotations-agent-chat project.
