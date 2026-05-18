# Delano Viewer Guide

The Delano viewer is a local, read-only UI for inspecting `.project` delivery contracts.

It helps people and agents understand current delivery state without editing files. It is not a replacement for `.project`, `HANDBOOK.md`, or validation.

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

## Read-Only Boundary

The viewer does not write delivery state.

It may expose convenience actions to open a selected markdown file or folder locally, but those actions are guarded to `.project` markdown files. Edit the files with your normal editor or through the Delano CLI, then refresh the viewer.

## When To Use It

Use the viewer:

- after install, to confirm `.project` is visible;
- before assigning work, to scan open projects and blocked tasks;
- during planning, to review spec, plan, workstreams, and tasks together;
- during review, to inspect evidence logs and updates;
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

Agents can use the viewer as a reading aid, but they should still inspect files directly before editing. A good instruction is:

```text
Use `delano status --open --brief` and the viewer to understand the project. Before editing, read the relevant spec, plan, workstream, and task files. Keep `.project` as the source of truth and run `delano validate` before handoff.
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
