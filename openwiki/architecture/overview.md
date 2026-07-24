# Architecture overview

## System shape

Delano has four cooperating layers:

1. **File contracts** in `.project/` model intent and delivery state.
2. **Runtime policy** in `.agents/` supplies schemas, scripts, rules, skills, hooks, and adapters.
3. **The npm CLI** in `bin/` and `src/cli/` installs and operates that runtime.
4. **The guarded viewer** in `.delano/viewer/` indexes, reviews, annotates, edits, and dispatches work from `.project/`.

`HANDBOOK.md` explains the operating model; files and validators make parts of it executable. There is no application database.

## CLI and runtime

`bin/delano.js` delegates to `src/cli/index.js`, which owns help, version handling, install shorthand, and command dispatch.

Native Node commands:

- `install`: plans conflict-first installation from the packaged allowlist.
- `onboarding`: analyzes the nearest `AGENTS.md` only after explicit approval.
- `context`: safely lists/reads Markdown below `.project/context/`.
- `roadmap`: non-destructively seeds optional direction files and creates, reads, moves, transitions, or promotes roadmap items.
- `viewer`: finds the repository and starts the packaged server with `DELANO_VIEWER_ROOT`.
- `project`, `workstream`, `task`, `update`: render templates or patch existing contracts; task mutations apply scoped parent/dependent rollups.

Wrapper commands (`init`, `import-spec-kit`, `research`, `validate`, `status`, `next`) execute mature Bash PM scripts through `src/cli/commands/wrapper.js` and `src/cli/lib/pm.js`. This hybrid explains why Node 18 is not the only practical prerequisite.

Native lifecycle commands patch existing files rather than regenerating them and intentionally do not run full validation after every mutation. Run `delano validate` at handoff/closure boundaries.

## Contract and policy layer

`.project/roadmap/` optionally contains one strategic contract per `RM-###-<slug>.md`. `.project/projects/<slug>/` contains a project dossier: typically `spec.md`, `plan.md`, `decisions.md`, plus `workstreams/`, `tasks/`, `updates/`, and optional `research/`. A spec may persist one `roadmap_item` reference; reverse links and receipts are derived. `.project/templates/` seeds new artifacts. `.project/context/` supplies repository knowledge, including optional vision and mission files, while `.project/registry/` holds external mapping/migration data rather than primary state.

`.agents/schemas/` defines artifact fields, status transitions, operating modes, evidence, synchronization, leases, metrics, and learning contracts. `.agents/scripts/pm/validate.sh` and the root `check:*` scripts enforce the machine-checkable subset. `.agents/skills/` describes the human/agent workflows that create and evolve the files.

`.claude/` is a generated compatibility mirror of `.agents/`; it must never become an independent policy fork.

## Viewer architecture

`.delano/viewer/server.js` is a dependency-free CommonJS HTTP server. It recursively indexes `.project` Markdown and serves the compiled SPA from `.delano/viewer/public/`. Important APIs include:

- `GET /api/index`, `GET /api/doc`: derived navigation/index data and Markdown with a SHA-256 baseline.
- `POST /api/roadmap/action`: guarded, whitelisted move or promotion with expected hash, confirmation, capability, and audit checks.
- `/api/annotations` and `/api/annotations/export`: review state and deterministic exports.
- `POST /api/apply/preview`, `POST /api/apply`: diff and guarded canonical writes.
- `POST /api/handover`: annotation handover or task/workstream start/review dispatch.
- `GET /api/events`, `GET /api/activity`: SSE changes and an in-memory activity ring.
- `POST /api/open`: contained local file/folder opening.

Canonical writes are restricted to known existing `.project/**/*.md` paths. The server rejects absolute paths, traversal, non-Markdown targets, unknown corpus paths, and symlink escapes. Apply also requires the current expected hash and literal confirmation. Annotation/audit state lives separately in `.project/viewer/annotations.json`; generated handovers live in `.project/viewer/handovers/`.

The React 19/Vite/TypeScript source is under `.delano/viewer/ui/`:

- `src/App.tsx` composes application hooks and shell.
- `src/app/` owns route state, index/document fetching, live events, project selection, navigation, and viewport behavior.
- `src/lib/domain/` derives navigation, workspace/project/task models, annotations, handovers, status, dates, and pagination.
- `src/lib/domain/roadmap.ts` and `roadmap-actions.ts` derive the horizon board, receipts, advisory staleness, affected-card updates, and guarded action payloads.
- `src/pages/` composes workspace, project, and document-reader experiences.
- `src/editor/` is the lazy-loaded TipTap editing surface.
- `src/lib/markdown/` retains the custom block/line-aware renderer needed for annotation anchors and change highlighting.

Routes are state-driven rather than React Router-based. Live events use `fs.watch` as a signal followed by a debounced full Markdown snapshot comparison, because Windows may coalesce bulk events. Open documents update silently unless a dirty editor would lose work.

The Roadmap workspace is capability-gated. It renders open `now | next | later` lanes plus an explicit terminal archive. Item or linked-project events refresh derived data and apply bounded feedback only to affected cards. Promotion returns a created spec; the existing `start` handover can be offered afterward but is not part of the mutation.

## Packaging pipeline

There are four distinct representations to keep synchronized:

```text
viewer UI source
  -> Vite build -> .delano/viewer/public/
repository runtime sources
  -> npm run build:assets -> assets/payload/
assets/payload/ + package files
  -> npm pack/publish -> installed consumer repository
```

`assets/install-manifest.json` is the allowlist. `scripts/build-npm-assets.mjs` reconstructs `assets/payload/` from it; `prepack` runs this step. It does **not** build the viewer UI, so UI changes require an explicit Vite build first.

Installation computes the full plan and conflicts before writing. Existing targets block by default; `--force` remains allowlist-bound. Update-safe flows can exclude repository-owned project, context, and registry state. Codex hook configuration is merged cautiously rather than blindly replaced.

## Integration boundaries

- **Coding agents:** adapter notes in `.agents/adapters/`; viewer handover supports external agent destinations while leaving permissions to the receiving agent.
- **GitHub/Linear:** schemas, fixtures, local maps, inspection, drift, and repair-planning scripts exist; default behavior is inspect-first and remote writes require approval. Linear mapping remains largely design-ready rather than operational.
- **Spec Kit:** `import-spec-kit` translates the supported Markdown shape into planned Delano contracts and validates them.
- **Context packs:** `delano context` exposes bounded, read-only profiles from `.project/context/`.
- **IDE/desktop/CLI launchers:** viewer open and handover endpoints guard repository paths and shell quoting, but the local server has no authentication layer.

## Why the architecture evolved this way

Recent history shows deliberate boundary tightening:

- Native template-backed state commands were added without discarding proven shell workflows.
- Viewer annotations were stored outside canonical Markdown so review could be writable without silently mutating contracts.
- An embedded chat experiment was replaced by deterministic handover to full external agents, keeping the viewer focused on review and dispatch.
- In-place editing reused the existing hash/confirmation/audit apply path instead of adding a second write endpoint.
- A corpus probe found limited TipTap normalization drift, so the UI warns rather than forbids editing.
- Windows watcher probing led to debounced rescans rather than trusting individual event paths.

Relevant history includes the chat-to-handover pivot (`d56680f`), work-dispatch expansion (`beb1fa6`), editing/live activity (`0e551e4`), viewer follow-up (`26fb322`, `1c37763`), and dependency-free slash-command tests (`9fbe19b`). Persistent commit lists are avoided elsewhere; these commits explain current architectural decisions.
