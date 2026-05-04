# Delano User Guide

This guide is about one thing: how to use the Delano CLI without guessing.

## Mental model

Delano has four important layers:

- npm package: distribution and command surface
- `.agents/`: shared runtime
- `.project/`: delivery truth inside your repo
- `.delano/`: optional read-only UI layer

The CLI is intentionally thin. It installs the approved runtime payload, launches the read-only viewer, and wraps the existing PM scripts. It does not replace the handbook or the file-contract model.

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
npx -y @bvdm/delano@latest --target /path/to/repo --yes
```

If the package is already installed in your repo or globally:

```bash
delano --yes
delano --target /path/to/repo --yes
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
- `delano viewer` launches the packaged read-only UI for `.project` contracts
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
- `.project/`
- `.delano/`
- `HANDBOOK.md`
- `install-delano.sh`

It does not install top-level adapter entry docs such as `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, or `PI.md`. Those remain opt-in.
It also does not install or overwrite repo-root Git config files such as `.gitignore` or `.gitattributes`.
The packaged `.project/context/` files are generic starter templates. They are seeded into the target repo during install and should be rewritten to match that repo's actual context.

## Conflict-first behavior

`delano install` is deliberately conservative:

- it computes the full install plan before writing files
- it aborts if an approved target path already exists
- it reports each conflict clearly
- it distinguishes file, directory, and symlink conflicts
- it only overwrites approved allowlist paths when `--force` is explicit

Use `--force` only when you are intentionally repairing or replacing files that belong to the Delano allowlist.

## Dependencies

Delano v1.1 expects:

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
npx -y @bvdm/delano@latest next -- --all
```

If the package is installed locally or globally, inside the installed repo:

```bash
delano onboarding
delano viewer
delano validate
delano status
delano next -- --all
```

Create a new delivery project:

```bash
delano init <slug> "<Project Name>" [owner] [lead]
```

Wrapper commands map directly to:

```bash
bash .agents/scripts/pm/validate.sh
bash .agents/scripts/pm/status.sh
bash .agents/scripts/pm/next.sh --all
bash .agents/scripts/pm/init.sh <slug> "<Project Name>" [owner] [lead]
```

`delano viewer` serves the selected repository's `.project` files read-only on `http://127.0.0.1:3977` by default. Set `DELANO_VIEWER_PORT` or `PORT` to choose another port.

## Day-to-day workflow

1. Install or validate the runtime.
2. Run `delano onboarding` and explicitly approve the `AGENTS.md` review if you want it.
3. Create a project scaffold with `delano init`.
4. Draft the spec in `.project/projects/<slug>/spec.md`.
5. Make the probe decision explicit before approving the spec.
6. Work through plans, workstreams, tasks, updates, and quality evidence.
7. Re-run `delano validate` before handoff or merge.

## Probe-aware delivery

The default flow is:

`Outcome -> Draft Spec -> Probe Decision -> Approved Spec -> Delivery Project -> Workstreams -> Tasks -> PRs -> Release -> Learnings`

Run a probe when the team would otherwise be approving a spec based on guesswork. Typical examples:

- a technical approach may not work yet
- an integration risk is untested
- the smallest safe rollout path is unclear
- a UI or workflow concept needs a fast reality check

If uncertainty is already low, record that and move on.

## v1.1 boundaries

This release stays intentionally narrow:

- npm is the product surface
- `.project` remains repo-owned after install
- `.project/context/` is starter seed data, not Delano repo state
- `.agents` remains the canonical runtime
- `.claude` remains compatibility only
- `install-delano.sh` remains the legacy bridge installer

## Read next

- `README.md` for the short overview
- `HANDBOOK.md` for the full operating model
- `.agents/scripts/README.md` for the runtime scripts
- `AGENTS.md` for adapter-neutral repo instructions
