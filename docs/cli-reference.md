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
| `delano viewer` | Start the read-only local UI for `.project`. | Nothing |
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

For Delano runtime development, also run:

```bash
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
