# Delano Guarded Viewer

Local shadcn-built frontend for browsing and reviewing `.project` markdown contracts.

- Review mode: serves files from `.project`, stores annotations in `.project/viewer/annotations.json`, and writes canonical markdown only through explicit preview/apply endpoints.
- Default starting URL: `http://127.0.0.1:3977`
- Override starting port: `DELANO_VIEWER_PORT=3987 npm run viewer`
- Multiple viewers can run at once. If the starting port is already in use, the viewer tries the next available port and prints the actual URL.

Run from the repository root:

```bash
npm run viewer
```

The viewer indexes `.project/context/**/*.md`, `.project/templates/**/*.md`, and `.project/projects/**/*.md`. It derives artifact roles (`spec`, `plan`, `workstream`, `task`, `progress`, `decision`, `context`, `template`), status fields, task/workstream relationships, relationship-like wikilinks, snippets, and renders markdown in a Tolaria-inspired review pane layout.

The `/api/index` response also exposes `contextPack` metadata from the shared context reader. It includes ordered context file metadata, missing-file warnings, and profile command references such as `delano context read --profile implementation`. It does not embed full context file content.

Project folders get a right-side outline for the spec, plan, decisions/progress, workstreams, and tasks. Selecting a workstream focuses the list on that workstream and its subtasks. Context and template folders keep filters scoped to the roles/statuses that actually exist in the selected folder.

The reader supports selected-text annotations with sticky popovers (unsaved feedback closes only through Save, the close button, or Escape), click-to-edit on existing highlights, a document contents rail, and a review panel with deterministic markdown/JSON export. The primary review output is agent handover: `POST /api/handover` writes a handover file under `.project/viewer/handovers/` with the selected annotations and returns a `codex://new` deep link that opens the Codex app (default), plus terminal-launch and copyable one-line command fallbacks for `codex` and `claude`. The same endpoint supports work dispatch on tasks and workstreams via `intent: "start" | "review"`: start hands the agent the contract to implement, review asks it to verify acceptance criteria and evidence (including captured annotations when present); these intents reference the contract directly and only write a handover file when annotation feedback exists. The receiving agent works under its own permissions; the viewer never writes canonical markdown through handover. File application remains guarded: the server checks repo-relative `.project` paths, current file hashes, and explicit confirmation before writing canonical markdown.

The reader also supports in-place editing. Pressing `E` (or Ctrl/Cmd+E, or the Edit button) switches the document body into a TipTap WYSIWYG editor with markdown-true serialization (headings, lists, task lists, tables, code fences, links). Frontmatter is never editable: it renders as a locked properties card and is reattached byte-identical on save. Saves go through the same guarded `POST /api/apply` path (`expectedHash` + `confirm`), so a stale baseline returns 409 and surfaces a conflict banner with explicit reload-theirs or keep-mine choices — the viewer never overwrites external changes silently. Documents whose markdown the serializer would normalize (for example table padding) show a "formatting will be tidied on save" hint instead of blocking.

The viewer watches `.project` recursively and streams changes over `GET /api/events` (SSE: `index-changed`, `doc-changed`, heartbeat; debounced rescan because Windows coalesces bulk file events). Open documents refresh live within ~2 seconds of an external write, changed blocks flash briefly, and the workspace index refreshes silently. A topbar Activity panel (backed by `GET /api/activity`, an in-memory ring buffer capped at 200 events) lists recent file changes newest-first with a pulsing indicator while events arrive — this is how you watch an agent work after a handover. Dispatching a handover leaves a persistent "handed over" banner on the document that links straight to the activity panel. If an open editor's file changes on disk, a clean editor follows silently and a dirty editor gets the conflict banner instead of losing work.

The browser client lives in `.delano/viewer/ui` and is built with the shadcn CLI plus real shadcn/Radix components. Run `npm --prefix .delano/viewer/ui run build` after changing the UI, then `npm run build:assets` before packaging.

Convenience buttons can open the selected markdown file's containing folder in the system explorer or open the file in VS Code. These actions are guarded so they only target markdown files inside `.project`.
