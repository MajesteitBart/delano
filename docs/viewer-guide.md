# Delano Viewer Guide

The Delano viewer is a local, guarded review UI for inspecting and annotating `.project` delivery contracts.

It helps people and agents understand current delivery state, draft findings against exact markdown selections, publish branch-local reviews, and hand contracts or tracked reviews to an agent. It is not a replacement for `.project`, `HANDBOOK.md`, or validation.

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

Project folders show a project-oriented outline for specs, plans, decisions, research, updates, workstreams, and tasks. Research is one entry that lists every Markdown file below the selected project's `research/` subtree; a nested research `progress.md` remains research rather than becoming a delivery update. Progress is likewise project-specific. Selecting a workstream narrows the task view to that workstream.

**Project overview** is a delivery dashboard, not an all-files table. Its summary strip and execution map show the project’s current task distribution; the project brief comes from the canonical spec; workstream rows expose completion, blockers, and active task drilldowns; and recent evidence links to the newest progress updates. These are current contract facts. The viewer does not draw historical or predictive graphs when the repository does not contain that history.

The workspace sidebar includes **Reviews** for tracked `.project/reviews/` artifacts and a legacy **Annotations** compatibility page used to inspect and explicitly migrate older viewer comments.

## Repository And Worktree Context

The searchable repository and worktree controls at the top of the sidebar use the machine-local Delano registry plus a fresh `git worktree list --porcelain` inventory. The registry stores local paths and timestamps at `~/.delano/repositories.json` (or `$DELANO_HOME/repositories.json`), so treat it as private machine metadata and do not commit or share it. Use `delano repos --forget <path>` to remove an entry without touching the repository itself.

The sidebar controls identify the selected repository and whether its worktree is primary or linked. Open their details control to inspect the full repository/worktree paths, branch or detached state, HEAD, selected `.project` source, availability, dirty files, and committed divergence from primary. The browser persists only a versioned pair of opaque IDs and restores it after refresh only if the fresh inventory still validates it; stale or missing choices fall back to the server's current context with an explanation rather than silently reading another path.

The selected worktree's own `.project/` directory is the viewer's project-data source and launch root. Primary versus linked role is provenance and risk information, not authorization. A fresh registered worktree receives server-derived `dispatch`, `review`, `publishReview`, and `applyContract` capabilities; a stale, switched, detached-without-required-identity, unavailable, or deleted context is denied with an actionable explanation and never falls back to another checkout. Restart a running viewer after updating server-side viewer code so its indexer and compiled client come from the same package state.

Workspace navigation contains **Projects**, **Tasks**, **Context pack**, **Reviews**, legacy **Annotations**, **Warnings**, and **Blockers**. The Tasks badge counts planned, ready, in-progress, and blocked contracts, but the page includes all indexed statuses, including done and deferred. Project and Workstream columns use searchable relationship choices derived from the active index. Status, Priority, and Estimate use canonical task-schema values exposed by `/api/index`; labels are presentation only, and a missing or malformed schema is shown as an error instead of replaced by viewer constants. Progress and Research stay under the selected project rather than appearing as cross-project Workspace entries.

Published review lifecycle and open counts derive from the review schema. The legacy annotation page retains non-deleted history solely for compatibility and migration.

Data tables use a single ledger boundary with shared row padding. Tables that expose Updated default to newest-first, except Context pack because context-reader order is canonical. Workspace Projects adds Created. Updated and Created filters offer Today, Last 7 days, Last 30 days, This year, and a custom inclusive range calendar. Text filters remain available for open-ended fields, and every active filter can be cleared by column or all at once.

Changing the selected project through the sidebar keeps a Workspace view active, retains the equivalent project section, or maps source documents by role. Activating a project name in the Workspace Projects table is intentionally different: it selects that project and opens Project overview. Repository/worktree switches keep the exact path when it exists in the new index and otherwise use the closest valid project section. Stale paths are never retained; only a missing semantic equivalent falls back to Projects or Project overview.

Coordination state is shared across worktrees under the Git common directory at `delano/leases/active-leases.json`. On first use, Delano safely migrates the legacy `.agents/leases/active-leases.json` only when there is no destination collision; conflicting copies are preserved and reported for manual resolution.

## Guarded Write Boundary

The viewer writes no tracked review state while findings are drafts. Drafts stay in browser-local storage, scoped to opaque repository/worktree IDs and the repository-relative source path. Explicit publication writes one schema-valid, human-readable review under `.project/reviews/`; it never commits, pushes, or posts remotely. Published artifacts contain repository-relative provenance and normalized source hashes, never machine-local paths or launch receipts.

Canonical markdown writes are separate from review publication and handover. A file apply request must target a known `.project` markdown file in the selected fresh worktree, include the current file hash, pass capability and containment checks, preview a diff, and set `confirm: true`.

The viewer may expose convenience actions to open a selected markdown file or folder locally, but those actions are guarded to `.project` markdown files.

## Draft Findings, Publication, and Agent Handover

In a document view:

- use the default reading mode for ordinary native text selection and copying;
- activate **Review** explicitly to reveal existing yellow highlights and the review panel;
- while Review is active in a context with `publishReview`, select text to open the finding popover;
- add a comment, question, verify request, or a quick review label;
- click an existing highlight to reopen its popover and edit or delete the annotation;
- use the review panel to select draft findings and explicitly publish a tracked review.

Documents always open in reading mode. Closing Review removes review-only highlights and dismisses an unsaved composer without changing locally saved draft findings. The fixed review panel overlays the page, including the header, without reserving width or changing document line length. Capability denials, rather than checkout role, determine whether selection and publication are available.

While Review remains open, the annotation popover is sticky: it closes only through Save, the close button, or Escape - clicking elsewhere in the document never discards unsaved feedback.

Publication is the durable review output. The **Publish** action posts to `/api/reviews` after explicit confirmation and writes a per-session artifact under `.project/reviews/`. Publishing from uncommitted source requires an explicit warning acknowledgement; the artifact records `source.commit: null` and binds freshness to normalized source content. The Viewer reports the created path and leaves Git actions to the user.

Handing over a published review references that tracked review path directly and then either:

- opens the Codex app through its `codex://new` deep link with the handover prompt and the repo as workspace (default for Codex),
- opens the chosen agent (`codex` or `claude`) in a new terminal at the selected worktree with a prompt that references the review artifact, or
- copies the equivalent one-line command to the clipboard so it can be pasted into any terminal.

The receiving agent works in the selected worktree under its own permissions and safety model; the viewer itself never writes canonical markdown through handover. The deep link needs the Codex desktop app installed; terminal launch needs the relevant CLI on `PATH`. When neither is available, use **Copy command** instead.

Legacy `.project/viewer/annotations.json` and generated handover documents are noncanonical compatibility inputs. Migration is explicit, idempotent, non-destructive, and reports ambiguous records instead of deleting or silently rewriting legacy evidence.

## Work Dispatch Handover

Tasks and workstreams also support dispatch-style handover that is about the work itself rather than annotation feedback. A **Hand over** button on task and workstream documents (and a per-row agent button on the Tasks and Workstreams pages) offers two intents:

- **Start the work**: hands the agent a prompt that references the contract file and tells it to read `AGENTS.md` plus the owning spec/plan, implement the acceptance criteria, record evidence, and update lifecycle state with the delano CLI.
- **Review delivered work**: tells the agent to verify each acceptance criterion and evidence entry against the implementation and record findings. A published review handover references its tracked `.project/reviews/` artifact directly.

Both intents use the same `/api/handover` endpoint (`intent: "start" | "review"`) and delivery paths: `codex://new` deep link, terminal launch, or copy command. Start/review handovers reference the contract directly and produce no canonical generated handover document.

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
Use `delano status --open --brief` and the viewer to understand the project. Run `delano context read --profile implementation`, then consume the assigned `.project/reviews/` artifact as scoped feedback and verify its source hash/freshness. Before editing, read the relevant spec, plan, workstream, and task files. Keep `.project` as the source of truth and run `delano validate` before handoff.
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

Normal validation reports dirty `.project` provenance without failing solely because the checkout is linked. Release validation applies the same cleanliness rule to primary and linked worktrees; clean the intended checkout before release or use `delano validate -- --release --allow-worktree-state` only when the documented explicit override is appropriate.

`delano viewer` runs the server and compiled assets from the active npm package. Fresh installs contain no repository-local `.delano/viewer`. Existing local copies are inert legacy files; inspect them before any manual cleanup, and never delete modified or unrecognized files automatically.
