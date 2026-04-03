# Delano

Delano is an agent-agnostic delivery runtime. It keeps planning, execution, and evidence on disk so teams can work with different coding agents without changing the operating model every time.

## What Delano is

- `HANDBOOK.md` is the canonical operating model.
- `.project/` is the delivery source of truth.
- `.agents/` is the shared runtime: scripts, rules, hooks, skills, and adapters.
- `.claude/` is a compatibility mirror of `.agents/`, not a second runtime.
- `.delano/` is an optional UI layer.

The npm package is intentionally thin. It distributes the approved runtime payload and wraps the existing shell-based PM scripts. It does not replace the handbook, the file contracts, or the underlying bash/Python execution layer.

## Delano CLI

- Package: `@bvdm/delano`
- Binary: `delano`
- Commands: `install`, `init`, `validate`, `status`, `next`
- Primary v1.1 goal: bootstrap a repo safely, then stay out of the way

## One-command bootstrap

To install the approved Delano runtime into the current repository:

```bash
npx -y @bvdm/delano@latest --yes
```

That shorthand is equivalent to:

```bash
npx -y @bvdm/delano@latest install --yes
```

To install into a different directory:

```bash
npx -y @bvdm/delano@latest --target /path/to/repo --yes
```

If you already have the package installed locally, the same flow is:

```bash
delano --yes
delano --target /path/to/repo --yes
```

## Global CLI install

If you want `delano` available in every repository you work in, install it globally:

```bash
npm install -g @bvdm/delano
```

Typical flow in a repository:

```bash
cd /path/to/repo
delano install --yes
delano validate
delano init <slug> "<Project Name>" [owner] [lead]
```

Command intent:

- `delano install` bootstraps the Delano runtime into the current repository
- `delano validate` checks whether the runtime and required assets are in place
- `delano init` creates a delivery project inside a repository that already has Delano installed

`delano init` usage:

```bash
delano init <slug> "<Project Name>" [owner] [lead]
```

Notes:

- use kebab-case for `<slug>`
- `owner` defaults to `team`
- `lead` defaults to `owner`
- this is the right command for an agent to scaffold a new delivery project after `delano install`

## How to use Delano after install

If you bootstrap with one-shot `npx`, keep using `npx` for wrapper commands:

```bash
npx -y @bvdm/delano@latest validate
npx -y @bvdm/delano@latest status
npx -y @bvdm/delano@latest next -- --all
```

If the package is installed locally or globally, run these inside the target repository:

```bash
delano validate
delano status
delano next -- --all
delano init <slug> "<Project Name>" [owner] [lead]
```

The wrapper commands call the existing PM scripts under `.agents/scripts/pm/`. You can also run those scripts directly:

```bash
bash .agents/scripts/pm/validate.sh
bash .agents/scripts/pm/status.sh
bash .agents/scripts/pm/next.sh --all
```

## Required dependencies

Delano v1.1 assumes these tools are available:

- `node` 18 or newer
- `bash`
- `git`
- `python3` or compatible `python` / `py`

The CLI does not bundle its own shell or Python runtime.

## Install behavior

`delano install` is conflict-first by default:

- it computes the full install plan before writing files
- it aborts if an approved target path already exists
- it reports each conflict as file, directory, or symlink
- it only overwrites approved allowlist paths when `--force` is used
- it does not touch unrelated files outside the allowlist
- it does not install or overwrite repo-root Git config files such as `.gitignore` or `.gitattributes`

The base install payload intentionally excludes top-level adapter entry docs such as `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, and `PI.md`. Those remain opt-in only.
The installable `.project/context/` pack is seeded from generic templates during packaging; it does not ship Delano's own repo-specific context files into consumer repositories.

## Optional AGENTS.md / CLAUDE.md snippet

If you want explicit Delano instructions in a repo-root `AGENTS.md` or `CLAUDE.md`, copy and paste this yourself:

```md
## Delano

This repository uses Delano.

Canonical process and contracts live in `HANDBOOK.md`.
Delivery state lives in `.project/`.
Shared runtime lives in `.agents/`.
`.claude/` is a compatibility mirror of `.agents/`, not a second runtime.

When working in this repository:
- treat `.project/` as the source of truth
- use the Delano status model and evidence discipline from `HANDBOOK.md`
- keep sync and quality gates aligned with the handbook
- use `delano init <slug> "<Project Name>" [owner] [lead]` to scaffold a new delivery project when needed
```

## v1.1 boundaries

This package is deliberately narrow:

- npm is the distribution surface
- `.project` remains repo-owned after install
- `.project/context/` installs as generic starter context that the target repo must replace with its own reality
- `.agents` remains the runtime surface
- wrapper commands stay thin in v1.1
- `install-delano.sh` remains available as the legacy bridge installer

## Local development

From this repository:

```bash
npm run build:assets
node bin/delano.js --help
node bin/delano.js --yes --target ./tmp/cli-install-smoke
```

## Read next

- `docs/user-guide.md` for the practical user flow
- `HANDBOOK.md` for the full operating model
- `.agents/scripts/README.md` for the runtime script inventory
- `AGENTS.md` for adapter-neutral instructions
