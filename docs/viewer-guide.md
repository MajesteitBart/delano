# Delano Viewer Guide

The Delano viewer is a local, guarded review UI for inspecting and annotating `.project` delivery contracts.

It helps people and agents understand current delivery state, attach review feedback to exact markdown selections, and hand annotation bundles over to a coding agent such as Codex or Claude Code. It is not a replacement for `.project`, `HANDBOOK.md`, or validation.

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

The workspace sidebar also includes an **Annotations** page. It lists viewer comments across all projects, links each row back to its source document, and stays outside the selected-project navigation.

## Guarded Write Boundary

The viewer writes only constrained review artifacts by default. Selected-text annotations are stored in `.project/viewer/annotations.json` and reference `.project` markdown by repo-relative path.

Canonical markdown writes are separate from annotations and handover. A file apply request must target a known `.project` markdown file, include the current file hash, pass path containment checks, preview a diff, and set `confirm: true`.

The viewer may expose convenience actions to open a selected markdown file or folder locally, but those actions are guarded to `.project` markdown files.

## Annotations and Agent Handover

In a document view:

- select text to open the annotation popover;
- add a comment, question, verify request, or a quick review label;
- click an existing highlight to reopen its popover and edit or delete the annotation;
- use the review panel to select annotations and hand the bundle over to an agent.

The annotation popover is sticky: it closes only through Save, the close button, or Escape - clicking elsewhere in the document never discards unsaved feedback.

Handover is the primary review output. The **Hand over** button posts to `/api/handover`, which writes a handover file under `.project/viewer/handovers/` containing the selected annotations plus agent instructions, and then either:

- opens the Codex app through its `codex://new` deep link with the handover prompt and the repo as workspace (default for Codex),
- opens the chosen agent (`codex` or `claude`) in a new terminal at the repo root with a prompt that references the handover file, or
- copies the equivalent one-line command to the clipboard so it can be pasted into any terminal.

The receiving agent works in the repository under its own permissions and safety model; the viewer itself never writes canonical markdown through handover. The deep link needs the Codex desktop app installed; the terminal launch needs the Codex CLI (`codex login`) or Claude Code (`claude`) on `PATH`. When neither is available, use **Copy command** instead.

Annotation bundles can still be exported as markdown or JSON from the same menu for manual workflows.

## Work Dispatch Handover

Tasks and workstreams also support dispatch-style handover that is about the work itself rather than annotation feedback. A **Hand over** button on task and workstream documents (and a per-row agent button on the Tasks and Workstreams pages) offers two intents:

- **Start the work**: hands the agent a prompt that references the contract file and tells it to read `AGENTS.md` plus the owning spec/plan, implement the acceptance criteria, record evidence, and update lifecycle state with the delano CLI.
- **Review delivered work**: tells the agent to verify each acceptance criterion and the evidence log against the actual implementation and record findings. When the document has captured annotations, they are written to a handover file and included as reviewer feedback.

Both intents use the same `/api/handover` endpoint (`intent: "start" | "review"`) and the same delivery paths: `codex://new` deep link, terminal launch, or copy command. Start/review handovers reference the contract directly and only write a handover file when there is annotation feedback to carry along.

The viewer client is built from `.delano/viewer/ui` with the shadcn CLI and real shadcn/Radix primitives for annotation controls and markers. When changing the viewer UI in this repository, run:

```bash
npm --prefix .delano/viewer/ui run build
npm run build:assets
```

## When To Use It

Use the viewer:

- after install, to confirm `.project` is visible;
- before assigning work, to scan open projects and blocked tasks;
- during planning, to review spec, plan, workstreams, and tasks together;
- during review, to annotate contract text and hand scoped feedback over to an agent;
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
Use `delano status --open --brief` and the viewer to understand the project. Run `delano context read --profile implementation`, then consume the review handover file under `.project/viewer/handovers/` as scoped feedback. Before editing, read the relevant spec, plan, workstream, and task files. Keep `.project` as the source of truth and run `delano validate` before handoff.
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
