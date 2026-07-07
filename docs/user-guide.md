# Delano User Guide

This guide is about one thing: how to use the Delano CLI without guessing.

## Mental model

Delano has four important layers:

- npm package: distribution and command surface
- `.agents/`: shared runtime
- `.project/`: delivery truth inside your repo
- `.delano/`: optional guarded viewer UI layer

The CLI is intentionally thin. It installs the approved runtime payload, launches the guarded viewer, and wraps the existing PM scripts. It does not replace the handbook or the file-contract model.

## Primary install flow

Bootstrap Delano into the current repository with one command:

```bash
npx -y @bvdm/delano@latest --yes
```

That is shorthand for:

```bash
npx -y @bvdm/delano@latest install --yes
```

Install into another directory:

```bash
npx -y @bvdm/delano@latest --target <repo> --yes
```

If the package is already installed in your repo or globally:

```bash
delano --yes
delano --target <repo> --yes
```

## Global npm install

If you want `delano` available everywhere, install it once:

```bash
npm install -g @bvdm/delano
```

Then in any repository:

```bash
delano onboarding
delano install --yes
delano viewer
delano validate
delano init <slug> "<Project Name>" [owner] [lead]
```

Important distinction:

- `delano install` installs the Delano runtime into the repository
- `delano viewer` launches the packaged guarded review UI for `.project` contracts
- `delano context` lists and reads `.project/context` through a safe read-only context-pack API
- `delano validate` verifies that the runtime is correctly installed
- `delano init` creates a delivery project after the runtime is already present

`delano init` usage:

```bash
delano init <slug> "<Project Name>" [owner] [lead]
```

Defaults:

- `owner` defaults to `team`
- `lead` defaults to `owner`

## What install does

The base install path copies only the approved allowlist payload:

- `.agents/`
- `.codex/hooks.json`
- `.project/`
- `.delano/`
- `HANDBOOK.md`
- `install-delano.sh`

It does not install top-level adapter entry docs such as `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, or `PI.md`. Those remain opt-in.
It also does not install or overwrite repo-root Git config files such as `.gitignore` or `.gitattributes`.
The `.codex/hooks.json` file configures a Codex `SessionStart` hook that adds compact open-project context on session startup and resume. It is inert until Codex hooks are enabled. If `.codex/hooks.json` already exists, `delano install` merges the Delano hook into the existing JSON instead of replacing it. Invalid or non-file hook configs are skipped without blocking the rest of the install.

Codex hook activation is intentionally manual:

1. Enable hooks for a session with `codex --enable hooks`, or persist the feature in `~/.codex/config.toml`:

   ```toml
   [features]
   hooks = true
   ```

2. Start Codex in the repository and approve the project trust prompt for the repo-local `.codex/` layer. Codex records trusted projects in `~/.codex/config.toml`, for example:

   ```toml
   [projects."<repo>"]
   trust_level = "trusted"
   ```

3. Approve the Delano `SessionStart` hook when Codex asks whether to trust it.

Older docs and builds may refer to `[features].codex_hooks`; newer Codex builds warn that this key is deprecated in favor of `[features].hooks`.

The packaged `.project/context/` files are generic starter templates. They are seeded into the target repo during install and should be rewritten to match that repo's actual context.
After install, `.project/context/`, `.project/projects/`, and `.project/registry/` are repo-owned state. Do not include them in forced refreshes unless you are intentionally replacing that local state.

## Conflict-first behavior

`delano install` is deliberately conservative:

- it computes the full install plan before writing files
- it aborts if an approved target path already exists
- it reports each conflict clearly
- it distinguishes file, directory, and symlink conflicts
- it only overwrites approved allowlist paths when `--force` is explicit
- it can narrow update plans before conflict detection with `--only`, `--exclude`, `--no-project-context`, and `--no-project-state`

Use `--force` only when you are intentionally repairing or replacing files that belong to the Delano allowlist.

Common update-safe examples:

```bash
delano install --interactive
delano install --only skills,project-templates --force --yes
delano install --no-project-state --force --yes
delano install --exclude project-context,project-projects,project-registry --force --yes
```

Use `delano install --interactive` when you want the CLI to show presets instead of remembering flags. The menu includes update-safe runtime refresh, skills plus project templates, full install or repair, and custom category selection.

Supported install categories are `agent-runtime`, `codex-hooks`, `skills`, `viewer`, `project-context`, `project-templates`, `project-registry`, `project-projects`, `handbook`, and `legacy-installer`.

## Dependencies

Delano currently expects:

- `node` 18+
- `bash`
- `git`
- `python3`, `python`, or `py`

The wrapper commands still execute the existing shell/Python runtime.

## First commands after install

Recommended first step:

```bash
delano onboarding
```

`delano onboarding` searches upward for `AGENTS.md`, asks for explicit approval before it analyzes anything, and prints recommendations using the packaged onboarding skill rubric. It never edits `AGENTS.md` on its own.

If you used one-shot `npx` for bootstrap, you can keep using `npx`:

```bash
npx -y @bvdm/delano@latest onboarding --approve-agents-analysis
npx -y @bvdm/delano@latest viewer
npx -y @bvdm/delano@latest validate
npx -y @bvdm/delano@latest status
npx -y @bvdm/delano@latest status --open --brief
npx -y @bvdm/delano@latest next -- --all
npx -y @bvdm/delano@latest context read --profile implementation
```

If the package is installed locally or globally, inside the installed repo:

```bash
delano onboarding
delano viewer
delano context list
delano context read --profile implementation
delano validate
delano status
delano status --open --brief
delano next -- --all
delano import-spec-kit <slug> <source-md> [--name <project-name>] [--owner <owner>] [--lead <lead>] [--json]
delano research <project-slug> <research-slug> [--title <title>] [--question <question>] [--json]
```

Create a new delivery project:

```bash
delano init <slug> "<Project Name>" [owner] [lead]
```

Wrapper commands map directly to:

```bash
bash .agents/scripts/pm/validate.sh
bash .agents/scripts/pm/status.sh
bash .agents/scripts/pm/status.sh --open --brief
bash .agents/scripts/pm/next.sh --all
bash .agents/scripts/pm/init.sh <slug> "<Project Name>" [owner] [lead]
bash .agents/scripts/pm/import-spec-kit.sh <slug> <source-md> [--name <project-name>] [--owner <owner>] [--lead <lead>] [--json]
bash .agents/scripts/pm/research.sh <project-slug> <research-slug> [--title <title>] [--question <question>] [--json]
```

`delano viewer` serves the selected repository's `.project` files on `http://127.0.0.1:3977` by default. It can store selected-text annotations in `.project/viewer/annotations.json`, hand selected annotations over to a coding agent (Codex or Claude Code) via generated handover files, and apply markdown changes only through explicit preview/apply checks. Set `DELANO_VIEWER_PORT` or `PORT` to choose another port.

`delano context` is the agent-friendly way to inspect `.project/context` before implementation work:

```bash
delano context list --json
delano context read --profile overview
delano context read --profile implementation --json
delano context read --profile ui
delano context read project-overview.md progress.md
```

Context reads are bounded and read-only. They do not summarize or mutate files, and they reject absolute paths, traversal, non-markdown selectors, non-context paths, and symlink escapes.

## First 15 minutes

If you are new to Delano or evaluating the Spec Kit interop path, start with [`first-15-minutes.md`](first-15-minutes.md). It walks from a plain idea to valid `.project` artifacts with validation and evidence gates.

For release review of the interop work itself, use [`spec-kit-interop-release-closeout.md`](spec-kit-interop-release-closeout.md).

## Focused user docs

Use the focused guides when you need more than the quick path:

- [`cli-reference.md`](cli-reference.md) for the full CLI surface, lifecycle commands, JSON output, task close behavior, and validation commands.
- [`viewer-guide.md`](viewer-guide.md) for starting and using the guarded local UI.
- [`agent-operator-guide.md`](agent-operator-guide.md) for instructing coding agents, assigning work, and preserving evidence discipline.
- [`release-notes.md`](release-notes.md) for a readable summary of the major context, viewer, handover, dispatch, and validation changes since `v0.2.11`.
- [`spec-kit-and-research.md`](spec-kit-and-research.md) for Spec Kit-style import, the research skill, and fold-forward rules.
- [`research-intake.md`](research-intake.md) for the detailed research file lifecycle.
- [`spec-kit/import-contract.md`](spec-kit/import-contract.md) for the accepted first import shape and mapping rules.

## Day-to-day workflow

1. Install or validate the runtime.
2. Run `delano onboarding` and explicitly approve the `AGENTS.md` review if you want it.
3. Create a project scaffold with `delano init`, or import the first supported Spec Kit-style markdown fixture with `delano import-spec-kit`.
4. If intent is unclear, open repo-native research intake with `delano research` and fold findings forward before execution.
5. Draft or review the spec in `.project/projects/<slug>/spec.md`.
6. Make the probe decision explicit before approving the spec.
7. Work through plans, workstreams, tasks, updates, and quality evidence.
8. Re-run `delano validate` before handoff or merge.

## Probe-aware delivery

The default flow is:

`Outcome -> Draft Spec -> Probe Decision -> Approved Spec -> Delivery Project -> Workstreams -> Tasks -> PRs -> Release -> Learnings`

Run a probe when the team would otherwise be approving a spec based on guesswork. Typical examples:

- a technical approach may not work yet
- an integration risk is untested
- the smallest safe rollout path is unclear
- a UI or workflow concept needs a fast reality check

If uncertainty is already low, record that and move on.

## Runtime boundaries

Delano stays intentionally narrow:

- npm is the product surface
- `.project` remains repo-owned after install
- `.project/context/` is starter seed data, not Delano repo state
- `.project/context/` can be read through `delano context`, but the command is intentionally read-only
- `.agents` remains the canonical runtime
- `.claude` remains compatibility only
- `install-delano.sh` remains the legacy bridge installer

## Read next

- `docs/README.md` for the user documentation index
- `docs/cli-reference.md` for the command reference
- `docs/viewer-guide.md` for the guarded viewer workflow
- `docs/agent-operator-guide.md` for instructing agents
- `docs/release-notes.md` for the current release summary
- `docs/spec-kit-and-research.md` for import and research workflows
- `README.md` for the short overview
- `HANDBOOK.md` for the full operating model
- `.agents/scripts/README.md` for the runtime scripts
- `AGENTS.md` for adapter-neutral repo instructions
