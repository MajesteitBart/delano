# Delano Viewer Guide

The Delano viewer is a local, guarded review UI for inspecting and annotating `.project` delivery contracts.

It helps people and agents understand current delivery state, attach review feedback to exact markdown selections, and submit annotation bundles to chat. It is not a replacement for `.project`, `HANDBOOK.md`, or validation.

## Start The Viewer

From a repo with Delano installed:

```bash
delano viewer
```

Open the printed URL. The default starting URL is:

```text
http://127.0.0.1:3977
```

Choose another target repository:

```bash
delano viewer --target <repo>
```

Choose a starting port:

```bash
DELANO_VIEWER_PORT=3987 delano viewer
```

`PORT` also works. If the requested port is busy, the viewer starts on the next available port and prints the actual URL.

## What It Shows

The viewer indexes:

```text
.project/context/**/*.md
.project/templates/**/*.md
.project/projects/**/*.md
```

It derives:

- artifact roles such as spec, plan, decision, update, workstream, task, context, and template;
- status fields;
- project outlines;
- workstream and task relationships;
- dependency-oriented navigation;
- snippets and rendered markdown.

Project folders show a project-oriented outline for specs, plans, decisions, updates, workstreams, and tasks. Selecting a workstream narrows the task view to that workstream.

## Guarded Write Boundary

The viewer writes only constrained review artifacts by default. Selected-text annotations are stored in `.project/viewer/annotations.json` and reference `.project` markdown by repo-relative path.

Canonical markdown writes are separate from annotation and chat. A file apply request must target a known `.project` markdown file, include the current file hash, pass path containment checks, preview a diff, and set `confirm: true`.

The viewer may expose convenience actions to open a selected markdown file or folder locally, but those actions are guarded to `.project` markdown files.

## Annotations and Chat

In a document view:

- select text to open the annotation popover;
- add a comment or quick review label;
- use the annotation drawer to select, delete, copy, or download annotation bundles;
- send selected annotations to chat as structured attachments.

The chat endpoint speaks the AI SDK UI message stream contract used by `@ai-sdk/react` and the viewer's shadcn `MessageScroller`. By default it tries the local Codex CLI and returns a deterministic local response when Codex is unavailable, so the attachment workflow remains testable without writing files.

For live Codex responses, install the Codex CLI if needed, run `codex login`, and start the viewer normally:

```bash
npm run viewer
```

The live path runs the local Codex CLI with `codex exec --json` and streams the assistant text back through the same AI SDK UI message stream response used by the fallback. This uses the user's existing Codex CLI subscription login instead of browser-side credentials. To verify the local prerequisite, confirm `codex exec --json --sandbox read-only` works from the repository.

The viewer invokes Codex with a read-only posture: `--sandbox read-only`, `--ephemeral`, `--ignore-user-config`, `--ignore-rules`, and non-interactive approval policy. Useful optional flags are:

- `DELANO_VIEWER_CODEX_MODEL`
- `DELANO_VIEWER_CODEX_COMMAND`
- `DELANO_VIEWER_CODEX_COMMAND_ARGS`

`DELANO_VIEWER_CODEX_COMMAND` and `DELANO_VIEWER_CODEX_COMMAND_ARGS` are advanced overrides for tests or custom local launchers; normal use should rely on `codex` from `PATH`.

When those runtime prerequisites are absent, chat stays in the same AI SDK stream format and explains that Codex is unavailable. Chat can propose edits, but canonical markdown writes still require the separate preview/apply flow.

The viewer client is built from `.delano/viewer/ui` with the shadcn CLI and real shadcn/Radix primitives for annotation controls, message scrolling, message bubbles, markers, and attachments. When changing the viewer UI in this repository, run:

```bash
npm --prefix .delano/viewer/ui run build
npm run build:assets
```

## When To Use It

Use the viewer:

- after install, to confirm `.project` is visible;
- before assigning work, to scan open projects and blocked tasks;
- during planning, to review spec, plan, workstreams, and tasks together;
- during review, to annotate contract text and submit scoped feedback to chat;
- before closeout, to check whether the project story is understandable from files alone.

Do not use the viewer as proof that validation passed. Always run:

```bash
delano validate
```

## Workflow Example

```bash
delano status --open --brief
delano viewer
delano next -- --all
```

Then open the task file, inspect its dependencies and evidence expectations, and only then instruct an agent to implement.

## Agent Usage

Agents can use the viewer as a reading and review aid, but they should still inspect files directly before editing. A good instruction is:

```text
Use `delano status --open --brief` and the viewer to understand the project. Run `delano context read --profile implementation`, then consume selected viewer annotation attachments as scoped feedback. Before editing, read the relevant spec, plan, workstream, and task files. Keep `.project` as the source of truth and run `delano validate` before handoff.
```

If an agent changes project contracts while the viewer is open, refresh the browser after the change.

## Troubleshooting

If the viewer starts on an unexpected port, another process is using the requested port. Use the printed URL.

If the viewer shows no projects:

- confirm Delano is installed in the target repo;
- check that `.project/projects/` exists;
- run `delano status`;
- run `delano validate` to catch malformed contracts.

If a task or workstream relationship looks wrong, inspect the task frontmatter in `.project/projects/<slug>/tasks/` and verify `workstream`, `depends_on`, and status fields.
