# Delano CLI Reference

This guide explains the user-facing `delano` command surface. It focuses on what to run, what each command writes, and which manual checks still matter.

## Install And First Run

Install Delano into the current repository:

```bash
npx -y @bvdm/delano@latest --yes
```

That is shorthand for:

```bash
npx -y @bvdm/delano@latest install --yes
```

If `delano` is installed locally or globally:

```bash
delano install --yes
```

Then run:

```bash
delano onboarding
delano validate
delano viewer
```

Do not skip `delano onboarding` if a repo already has `AGENTS.md`. It reviews the instructions only after explicit approval and does not edit them by itself.

## Manual Steps The CLI Does Not Do For You

- It does not automatically trust Codex hooks. Enable hooks and approve trust prompts manually if you want the session startup hook.
- It does not install top-level adapter entry docs such as `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, or `PI.md`.
- It does not replace `.project/context/` with accurate repo knowledge. The starter context must be rewritten for the target repo.
- It does not approve specs, run probes, close tasks, or mark projects done without explicit lifecycle commands and evidence.
- It does not perform remote GitHub or Linear writes in the default flow.
- It does not overwrite existing allowlisted files unless `--force` is explicit.

## Command Map

Use `delano --help` and `delano <command> --help` for live command help.

| Command | Purpose | Writes |
| --- | --- | --- |
| `delano install` | Install the approved runtime payload into a repo. | `.agents/`, `.project/`, `.delano/`, `HANDBOOK.md`, selected allowlist files |
| `delano onboarding` | Review repo-root agent instructions with explicit approval. | Nothing by default |
| `delano viewer` | Start the guarded local review UI for `.project`. | `.project/viewer/annotations.json`; canonical markdown only through explicit preview/apply |
| `delano context` | List and read `.project/context` as a safe context pack. | Nothing |
| `delano repos` | List or forget machine-local repository registrations used by the viewer. | `~/.delano/repositories.json` (or `$DELANO_HOME/repositories.json`) |
| `delano worktrees` | List fresh Git-reported worktrees and `.project` health for a repository. | Nothing |
| `delano project` | Create, show, and patch project contracts. | `.project/projects/<slug>/` |
| `delano workstream` | Add, show, and patch workstream contracts. | `.project/projects/<slug>/workstreams/` |
| `delano task` | Add, show, and patch task contracts with lifecycle rollups. | `.project/projects/<slug>/tasks/` and parent rollups |
| `delano update` | Add progress updates from templates. | `.project/projects/<slug>/updates/` |
| `delano init` | Wrapper for the legacy PM project initializer. | `.project/projects/<slug>/` |
| `delano import-spec-kit` | Create a planned Delano project from a supported Spec Kit-style markdown artifact. | `.project/projects/<slug>/` |
| `delano research` | Create repo-native research intake files inside an existing project. | `.project/projects/<slug>/research/<research-slug>/` |
| `delano validate` | Run Delano project/runtime validation. | Nothing |
| `delano status` | Show project status. | Nothing |
| `delano next` | Select next project task candidates. | Nothing |

## Install

Run:

```bash
delano install --yes
```

Use update-safe variants when the repo already has Delano state:

```bash
delano install --interactive
delano install --only skills,project-templates --force --yes
delano install --no-project-state --force --yes
delano install --exclude project-context,project-projects,project-registry --force --yes
```

Install categories are:

```text
agent-runtime, codex-hooks, skills, viewer, project-context, project-templates,
project-registry, project-projects, handbook, legacy-installer
```

Use `--force` only after checking the install plan. Delano is conflict-first by design.

## Context

List the context pack:

```bash
delano context list
delano context list --json
```

Read a focused profile:

```bash
delano context read --profile overview
delano context read --profile implementation --json
delano context read --profile ui --max-chars 12000
```

Read exact context files:

```bash
delano context read project-overview.md progress.md
delano context read --file .project/context/project-overview.md --json
```

Profiles are:

| Profile | Purpose |
| --- | --- |
| `overview` | High-level project, product, and progress context. |
| `implementation` | Technical and structural context for coding tasks. |
| `ui` | Product, style, and GUI testing context for interface work. |
| `all` | Every discovered markdown file in canonical context order. |

`delano context` is read-only. It never edits, creates, summarizes, or rewrites `.project/context` files. Selectors must stay below `.project/context`, must be markdown files, and fail closed for absolute paths, traversal, non-context paths, unreadable files, and symlink escapes. JSON output uses repo-relative paths only and includes ordered file metadata, missing required files, warnings, content for reads, and truncation state.

## Repository Registry And Worktrees

Successful Delano commands quietly register the repository's primary Git worktree. The machine-local registry is stored at `~/.delano/repositories.json`, or `$DELANO_HOME/repositories.json` when `DELANO_HOME` is set. It contains local display names, primary paths, stable IDs derived from the Git common directory, and last-seen timestamps. It never contains project files, task contents, remotes, credentials, or registry telemetry, and it is not copied into installed repositories or npm payloads.

Inspect or remove registrations:

```bash
delano repos
delano repos --json
delano repos --forget <repo-or-worktree-path>
```

Registry reads prune missing primary paths. Registration is success-only, atomic, and deduplicates linked worktrees under their primary repository. Forgetting removes only the machine-local entry; it does not delete a repository or worktree.

Ask Git for the current worktree inventory:

```bash
delano worktrees
delano worktrees --target <repo-or-worktree-path> --json
```

The result identifies primary, linked, detached, locked, prunable, and unavailable worktrees without scanning unrelated directories. Each entry also reports whether `.project` is present and whether its state is clean, dirty, diverged from the primary worktree, or unavailable. The viewer reads this fresh inventory rather than treating registry paths as authority.

## Project Lifecycle

Create a project:

```bash
delano project create reminder-email-preferences \
  --name "Reminder Email Preferences" \
  --owner team \
  --lead team \
  --json
```

Show a project:

```bash
delano project show reminder-email-preferences --json
```

Patch lifecycle:

```bash
delano project start reminder-email-preferences --reason "Spec approved after review." --json
delano project block reminder-email-preferences --owner team --check-back 2026-05-25 --reason "Waiting for policy decision." --json
delano project close reminder-email-preferences --evidence "All tasks closed and release evidence recorded." --json
```

Use `project create` for the modern CLI-created template path. `delano init` remains available as a wrapper around the existing PM script.

## Workstreams

Add a workstream:

```bash
delano workstream add reminder-email-preferences WS-A \
  --name "Delivery Foundation" \
  --owner platform \
  --json
```

Lifecycle examples:

```bash
delano workstream start reminder-email-preferences WS-A --reason "First task started." --json
delano workstream block reminder-email-preferences WS-A --owner security --check-back 2026-05-25 --reason "Security review pending." --json
delano workstream close reminder-email-preferences WS-A --evidence "All WS-A tasks done." --json
```

Workstream close requires no open tasks in that workstream.

## Tasks

Add a task:

```bash
delano task add reminder-email-preferences T-001 \
  --name "Implement quiet-hours policy" \
  --workstream WS-A \
  --acceptance "Quiet-hours reminders defer and remain audit-visible." \
  --json
```

New tasks are created with `status: planned`. Promote them to `ready` only after dependency and execution-readiness review; `ready` remains accepted for existing task files.

Use dependencies when one task cannot start before another:

```bash
delano task add reminder-email-preferences T-002 \
  --name "Expose quiet-hours settings" \
  --workstream WS-A \
  --depends-on T-001 \
  --json
```

Lifecycle examples:

```bash
delano task start reminder-email-preferences T-001 --json
delano task update reminder-email-preferences T-001 --message "Implemented service path and added tests." --json
delano task block reminder-email-preferences T-002 --owner dependency --check-back 2026-05-25 --reason "Waiting on T-001." --json
delano task close reminder-email-preferences T-001 --evidence "Implemented and tests passed." --json
```

`task close` requires `--evidence`. When a task closes, Delano can automatically open dependency-only blocked dependents whose dependencies are now all done. In human output and JSON, those opened tasks appear in the `changes` list, for example:

```text
.project/projects/reminder-email-preferences/tasks/T-002-expose-quiet-hours-settings.md status -> ready
```

Delano does not open tasks blocked on an external owner such as a vendor or reviewer.

## Updates

Add progress:

```bash
delano update add reminder-email-preferences \
  --message "Quiet-hours policy implemented; UI task is now unblocked." \
  --task T-001 \
  --stream WS-A \
  --section completed \
  --json
```

Use updates for project history and handoff notes that should not be hidden in an agent transcript.

## Spec Kit Import

Import a supported single-file Spec Kit-style markdown artifact:

```bash
delano import-spec-kit reminder-email-preferences docs/spec-kit/fixtures/minimal-spec-kit-project.md \
  --name "Reminder Email Preferences" \
  --owner team \
  --lead team \
  --json
```

The command creates a planned Delano project and runs validation by default. Use `--no-validate` only for a controlled fixture or repair workflow.

Read [`spec-kit-and-research.md`](spec-kit-and-research.md) and [`spec-kit/import-contract.md`](spec-kit/import-contract.md) before using imported work as execution truth.

## Research

Open research intake inside an existing project:

```bash
delano research reminder-email-preferences quiet-hours-policy \
  --title "Quiet-hours policy" \
  --question "Should urgent reminders bypass quiet hours, and what audit evidence is required?" \
  --owner team \
  --json
```

Research creates:

```text
.project/projects/reminder-email-preferences/research/quiet-hours-policy/
  task_plan.md
  findings.md
  progress.md
```

Research output is not executable task truth. Fold durable conclusions into `spec.md`, `plan.md`, `decisions.md`, workstreams, tasks, or updates.

## Status, Next, And Validation

Use status before starting work:

```bash
delano status
delano status --open --brief
```

Find next work:

```bash
delano next -- --all
```

Validate before handoff:

```bash
delano validate
```

Validation blocks a linked worktree with uncommitted `.project` changes by default. Use `delano validate -- --allow-worktree-state` only for an intentional inspection or repair flow; the override does not make linked viewer contexts writable.

For Delano runtime development, also run:

```bash
npm --prefix .delano/viewer/ui install
npm --prefix .delano/viewer/ui run build
npm run build:assets
npm run check:package-manifest
npm test
```

## Agent Output

Agents should prefer `--json` for commands they need to parse. Human-facing summaries are intentionally concise, but JSON mode provides stable fields such as `ok`, `command`, `project`, `task`, `status`, `changes`, `files`, and `validation` depending on command.

When instructing an agent, require it to report:

- commands run;
- files changed;
- validation evidence;
- unresolved blockers;
- working tree status;
- whether any manual approval is still needed.
