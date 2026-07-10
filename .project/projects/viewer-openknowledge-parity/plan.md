---
name: Viewer OpenKnowledge Parity
status: done
lead: bart
created: 2026-07-09T23:54:25Z
updated: 2026-07-10T01:14:49Z
linear_project_id: 
risk_level: medium
spec_status_at_plan_time: planned
operating_mode: feature
---

# Delivery Plan: Viewer OpenKnowledge Parity

## What Changed After Probe

- GO on TipTap + `@tiptap/markdown` (334 files: 0 parse errors, 0 frontmatter failures, 5 minor normalization cases — see spec Probe Findings). Instead of chasing byte-perfect serialization, the editor detects a non-clean round-trip on entry and shows a "formatting will be normalized on save" hint (D-003). No locked-raw-block fallback needed.
- fs.watch confirmed viable on win32; polling fallback dropped. Watcher design amended: debounce + rescan on events because Windows coalesces bulk operations into few events with directory-level paths.
- T-003 collapsed to client integration: existing `POST /api/apply` already implements the guarded save contract with test coverage (D-001).

## Technical Context

- Viewer server: `.delano/viewer/server.js`, plain Node `http`, no framework. Existing endpoints: `/api/index`, `/api/doc`, `/api/annotations(+/export)`, `/api/apply/preview`, `/api/apply`, `/api/handover`, `/api/open`. Writes are `.project`-scoped and hash-checked.
- Viewer client: `.delano/viewer/ui` — React 19, Vite 8, Tailwind v4, shadcn/Radix, Inter + JetBrains Mono. Built bundle is copied to `.delano/viewer/public/assets` and packaged by `npm run build:assets` into `assets/payload/`.
- Read-mode markdown rendering is a hand-rolled, line-anchored block renderer (`src/lib/markdown/renderMarkdown.ts`) that the annotation layer depends on. It must not change.
- Reference bar: OpenKnowledge (TipTap 3 + remark bridge + Yjs). We adopt its editing feel (TipTap 3 + official `@tiptap/markdown`) but not its CRDT infra — the viewer is local single-user; SSE + hash-guarded writes give the same perceived behavior at a fraction of the machinery.

## Architecture Decisions

- AD-1 **Editor**: TipTap 3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `@tiptap/extension-link`, task-list extensions) with official `@tiptap/markdown` for parse/serialize. Lazily imported route-level chunk so read-only paths pay nothing.
- AD-2 **Frontmatter**: split before parse, byte-preserved, re-prepended on save. Rendered as a locked properties card in edit mode. The serializer never sees it.
- AD-3 **Save path**: reuse the apply chokepoint semantics — new `POST /api/save` (or extended `/api/apply`) that takes `{path, baseHash, markdown}`, validates `.project`-relative path + hash, writes atomically, returns new hash. Same guard code as existing apply.
- AD-4 **Live updates**: recursive `fs.watch` on `.project` (win32 + darwin support recursive) with 250ms debounce, fan-out over a `GET /api/events` SSE stream (`index-changed`, `doc-changed`, `heartbeat` every 25s). No new dependencies. Fallback (if watch proves unreliable in probe step): 2s mtime polling behind the same SSE interface — client unaware.
- AD-5 **Change visualization**: on `doc-changed` in read mode, refetch and diff at the existing block level (line-anchored ids); changed blocks get a brief background flash (`--ease-out-strong`, ~1.2s). Fallback: whole-pane subtle flash.
- AD-6 **Conflict model**: last-writer-wins with hash guard. Dirty editor + external change = banner (reload theirs / keep mine); save with stale hash = 409 + same banner. No silent merges.
- AD-7 **Activity feed**: in-memory ring buffer (server, cap 200 events) exposed over SSE + `GET /api/activity` snapshot; client panel with relative times and kind icons; pulsing "agent working" dot while events stream.
- AD-8 **Delegation split**: design-bearing UI (editor chrome, activity feed, motion, conflict banners) is authored by Claude (taste requirement); mechanical work (server watcher/SSE/save endpoint, probe harness, wiring tests) and all browser E2E verification are delegated to Codex `gpt-5.6-sol` per `.agents/rules/browser-delegation.md`.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit (probe_required: true, T-001 gates WS-B)
- [x] Evidence gates are defined before handoff (per-task evidence in updates/, E2E evidence from Codex runs)
- [x] External sync writes require dry-run or operator approval (no tracker writes in this project)

## Generated Artifact Map

- `spec.md`: Created from `.project/templates` by `delano project create`; filled by discovery.
- `plan.md`: Created from `.project/templates` by `delano project create`; filled by planning.
- `workstreams/`: WS-A (probe + platform), WS-B (editing), WS-C (real-time), WS-D (handoff polish + quality).
- `tasks/`: T-001..T-010 created by `delano task add`, acceptance criteria binary, dependencies acyclic.

## Complexity Exceptions

- None. No new server dependencies; UI dependency additions limited to TipTap packages.

## Probe-Driven Architecture Changes

- AD-4 amended: watcher events are treated as "something changed under this subtree" signals; on each debounced tick the server rescans mtimes of known docs to derive precise per-file `doc-changed` events, instead of trusting event paths one-to-one (Windows coalescing).
- AD-1 amended: editor computes round-trip cleanliness when entering edit mode; non-clean documents show a normalization hint chip. SM-2 satisfied via surfaced normalization rather than byte-perfect serialization for the 5 known historical edge cases.
- AD-3 resolved: no new endpoint; editor saves call `POST /api/apply` with `reason: "editor save"`.

## Workstream Design

- **WS-A Probe & Platform** (gates everything): T-001 round-trip fidelity harness + corpus report; T-002 watcher reliability spot-check on win32 (bulk git checkout, editor saves, agent writes).
- **WS-B Manual Editing**: T-003 guarded save endpoint (Codex); T-004 editor surface — TipTap setup, markdown round-trip integration, frontmatter card, mode toggle (Claude, design-bearing); T-005 save/conflict UX — shortcuts, toasts, banners (Claude).
- **WS-C Real-Time**: T-006 server watcher + SSE + activity buffer (Codex); T-007 client live-refresh + block flash + activity feed panel + agent-working indicator (Claude).
- **WS-D Handoff Polish & Quality**: T-008 dispatched-state UX tying handover to the live feed (Claude); T-009 browser E2E smoke of AC-001/002/004/005 via Codex; T-010 packaging, `delano validate`, `npm test`, evidence rollup, closeout.
- One stream owner per shared file: `server.js` owned by Codex tasks (T-003/T-006 sequenced), `ui` reader page owned by Claude tasks; overlaps sequenced, not parallel.

## Milestone Strategy

- M1 (probe gate): T-001 + T-002 evidence recorded; go/no-go on `@tiptap/markdown`.
- M2 (edit loop): T-003–T-005 — edit → save → conflict flows work end to end locally.
- M3 (live loop): T-006–T-007 — external writes visible live with flashes + feed.
- M4 (ship gate): T-008–T-010 — handoff polish, E2E evidence, packaging, validation, closeout.

## Rollout Strategy

- Single draft PR from worktree branch `worktree-viewer-ok-parity`; no feature flags (viewer is local tooling). Packaged payload rebuilt (`npm --prefix .delano/viewer/ui run build`, then `npm run build:assets`) so `check:package-manifest` stays clean. No remote/production surface.

## Test Strategy

- Probe harness: node script over all committed `.project/**/*.md`, semantic diff + frontmatter byte check (T-001, rerun in T-010).
- Unit/integration: server tests for save-endpoint guards (path scope, hash mismatch, atomicity) and SSE lifecycle; existing `npm test` suite must stay green.
- UI: `typecheck`, `lint`, production build; domain check script.
- Browser E2E (Codex, per browser-delegation rule): scripted flows — open doc, edit, save, verify file on disk; external modify, verify live refresh + flash; dirty-edit conflict banner; handover dispatched state. Screenshots to repo-relative `output/`.
- Accessibility: keyboard reachability of edit/save/escape verified in E2E script.

## Rollback Strategy

- All changes on one branch; revert = close PR / revert merge commit. Viewer features are additive behind the edit toggle and SSE endpoint; read-only paths and annotation flows are untouched, so partial rollback (dropping WS-C or WS-B commits) leaves a working viewer. `.project` contract files for this project can be closed as `deferred` without runtime impact.

## Remaining Delivery Risks

- R-1: `@tiptap/markdown` table/task-list serialization drift on corpus edge cases — mitigated by probe gate + locked-raw-block fallback.
- R-2: `fs.watch` recursive quirks on Windows (duplicate events, renames) — mitigated by debounce + T-002 spot-check + polling fallback.
- R-3: Annotation anchors going stale on edited files — accepted and surfaced (flagged stale, not migrated); documented in decisions.md.
- R-4: Bundle growth from TipTap — mitigated by lazy chunk; size checked in T-010.
