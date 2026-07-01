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

The reader supports selected-text annotations with sticky popovers (unsaved feedback closes only through Save, the close button, or Escape), click-to-edit on existing highlights, a document contents rail, and a review panel with deterministic markdown/JSON export. The primary review output is agent handover: `POST /api/handover` writes a handover file under `.project/viewer/handovers/` with the selected annotations and returns a `codex://new` deep link that opens the Codex app (default), plus terminal-launch and copyable one-line command fallbacks for `codex` and `claude`. The receiving agent works under its own permissions; the viewer never writes canonical markdown through handover. File application remains guarded: the server checks repo-relative `.project` paths, current file hashes, and explicit confirmation before writing canonical markdown.

The browser client lives in `.delano/viewer/ui` and is built with the shadcn CLI plus real shadcn/Radix components. Run `npm --prefix .delano/viewer/ui run build` after changing the UI, then `npm run build:assets` before packaging.

Convenience buttons can open the selected markdown file's containing folder in the system explorer or open the file in VS Code. These actions are guarded so they only target markdown files inside `.project`.
