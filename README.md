# Delano

Delano is an agent-agnostic delivery runtime. It keeps planning, execution, and evidence on disk so teams can work with different coding agents without changing the operating model every time.

## What Delano is

- `HANDBOOK.md` is the canonical operating model.
- `.project/` is the delivery source of truth.
- `.agents/` is the shared runtime: scripts, rules, hooks, skills, and adapters.
- `.claude/` is a compatibility mirror of `.agents/`, not a second runtime.
- `.delano/` is an optional UI layer.

The npm package is intentionally thin. It distributes the approved runtime payload, includes the read-only viewer UI, and wraps the existing shell-based PM scripts. It does not replace the handbook, the file contracts, or the underlying bash/Python execution layer.

## Delano CLI

- Package: `@bvdm/delano`
- Current package version: `0.2.1`
- Binary: `delano`
- Commands: `onboarding`, `install`, `viewer`, `init`, `validate`, `status`, `next`
- Primary goal: bootstrap a repo safely, expose local delivery state clearly, and keep runtime gates verifiable

## Recent main changes

The latest main merges moved Delano beyond a thin install wrapper:

- PR #4, `feat/delano-vnext-runtime-upgrade`, merged on 2026-05-04. This added the v0.2 runtime layer: schema-backed `.project` artifact validation, operating-mode and status-transition checks, evidence mapping, strict validation fixtures, privacy-safe logging defaults, package/payload drift checks, dry-run sync inspection, apply-gated repair planning, lease-based multi-agent coordination, worktree health checks, delivery metrics, context audits, skill-output eval fixtures, and compact root/adapter agent instructions.
- PR #3, `delano-viewer-design-overhaul`, merged on 2026-04-29. This added the packaged read-only Delano viewer under `.delano/viewer`, including the local Node server, static UI, `.project` indexing APIs, project outlines, workstream/task navigation, rendered markdown, context-aware filters, guarded open actions, and visual/browser smoke evidence.

The current runtime still treats `HANDBOOK.md` and `.project/` as the source of truth. The new pieces make that model easier to inspect and harder to bypass accidentally.

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
delano viewer
delano validate
delano init <slug> "<Project Name>" [owner] [lead]
```

Command intent:

- `delano install` bootstraps the Delano runtime into the current repository
- `delano viewer` launches the read-only local UI for `.project` contracts
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

Recommended first step:

```bash
delano onboarding
```

`delano onboarding` searches upward for `AGENTS.md`, asks for explicit approval before it analyzes anything, and prints recommendations using the packaged onboarding skill rubric. It does not edit `AGENTS.md` on its own.

If you bootstrap with one-shot `npx`, keep using `npx` for wrapper commands:

```bash
npx -y @bvdm/delano@latest onboarding --approve-agents-analysis
npx -y @bvdm/delano@latest viewer
npx -y @bvdm/delano@latest validate
npx -y @bvdm/delano@latest status
npx -y @bvdm/delano@latest next -- --all
```

If the package is installed locally or globally, run these inside the target repository:

```bash
delano onboarding
delano viewer
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

The viewer is packaged with `@bvdm/delano` and serves the selected repository's `.project` files read-only. It defaults to `http://127.0.0.1:3977`; set `DELANO_VIEWER_PORT` or `PORT` to use another port. It indexes `.project/context`, `.project/templates`, and `.project/projects`, then derives artifact roles, statuses, project outlines, task/workstream relationships, snippets, and rendered markdown for local inspection.

## Required dependencies

Delano assumes these tools are available:

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
The base install payload includes `.delano/`, including the read-only viewer UI.
The installable `.project/context/` pack is seeded from generic templates during packaging; it does not ship Delano's own repo-specific context files into consumer repositories.
After install, the recommended first step is `delano onboarding`, which requires explicit approval before it reviews `AGENTS.md`.

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
- use `delano viewer` to inspect `.project/` through the read-only local UI
```

## Runtime boundaries

This package is deliberately narrow:

- npm is the distribution surface
- `.project` remains repo-owned after install
- `.project/context/` installs as generic starter context that the target repo must replace with its own reality
- `.agents` remains the runtime surface
- wrapper commands stay thin
- `install-delano.sh` remains available as the legacy bridge installer
- remote GitHub/Linear writes remain outside the default flow; current sync tooling is dry-run and repair-plan oriented unless an operator explicitly approves an apply-capable workflow

## Runtime validation

The v0.2 runtime upgrade expanded `delano validate` and `bash .agents/scripts/pm/validate.sh` with local gates for:

- artifact schemas, artifact scope, operating modes, status transitions, dependencies, blockers, and acceptance/evidence mapping
- privacy-safe prompt/log defaults and path-output safety
- package manifest and install payload drift
- local/GitHub/Linear sync inspection, drift reporting, and apply-gated repair planning
- lease contracts, conflict zones, stream-aware next-task selection, handoff summaries, and worktree health
- delivery metrics, project metrics summaries, context audit scoring, skill-output eval fixtures, and closeout learning proposals

For release readiness, run:

```bash
npm run build:assets
npm run check:package-manifest
bash .agents/scripts/pm/validate.sh
npm test
```

## Local development

From this repository:

```bash
npm run build:assets
node bin/delano.js --help
node bin/delano.js --yes --target ./tmp/cli-install-smoke
```

## Publishing

Publishing is handled by the GitHub Actions workflow `.github/workflows/publish-npm.yml`.

Before the first Actions publish, configure npm trusted publishing for `@bvdm/delano` with:

- Publisher: GitHub Actions
- Organization or user: `MajesteitBart`
- Repository: `delano`
- Workflow filename: `publish-npm.yml`

The package metadata must keep `repository.url` set to `https://github.com/MajesteitBart/delano`; npm validates that value against the GitHub Actions provenance bundle.

After trusted publishing is configured, publish by pushing a matching version tag such as `v0.2.1`, or run the `Publish package to npm` workflow manually from `main`. The workflow rebuilds the package payload, checks manifest drift, runs tests, dry-runs the package contents, verifies the version is not already published, and then runs `npm publish --access public` from GitHub Actions using OIDC. A manual `dry_run` input is available to run the same checks without publishing.

If npm publish fails after the package checks pass, verify that the npm trusted publisher settings match the repository and workflow filename exactly, and that the workflow has `id-token: write`.

## Read next

- `docs/user-guide.md` for the practical user flow
- `HANDBOOK.md` for the full operating model
- `.agents/scripts/README.md` for the runtime script inventory
- `AGENTS.md` for adapter-neutral instructions
