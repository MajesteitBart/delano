---
name: Delano CLI Packaging v1
slug: delano-cli-packaging-v1
owner: team
status: complete
created: 2026-04-03T11:59:43Z
updated: 2026-04-28T22:08:32Z
outcome: Delano ships a Windows-usable v1 npm package `@bvdm/delano` with the `delano` binary, conservative allowlist-driven install behavior, and wrapper commands for `install`, `init`, `validate`, `status`, and `next` without replacing the existing shell/Python runtime.
uncertainty: medium
probe_required: false
probe_status: skipped
---

# Spec: Delano CLI Packaging v1

## Executive Summary
- Add a thin npm packaging layer around Delano's current runtime so operators can install and run Delano through `@bvdm/delano` instead of a GitHub-fetch shell bootstrap alone.
- Keep Delano handbook-first and file-contract-first: `.project` remains delivery truth, `.agents` remains the canonical runtime, `.claude` stays compatibility-only, and existing PM scripts remain the execution layer in v1.
- Make installation conservative by default: compute the full plan, detect conflicts up front, and refuse to overwrite existing files unless the user explicitly opts into `--force`.

## Problem and Users
- Delano currently relies on a shell-first installer and direct script paths, which is workable for maintainers but awkward for broader adoption and package versioning.
- The current installer is broader than the desired v1 base install: it installs top-level agent entry docs by default and actively manages `.claude`, both of which conflict with the new packaging brief.
- Primary users are Delano maintainers and operators who want a versioned npm-distributed CLI, plus coding-agent users who need Delano installed into repositories without surprising file mutations.

## Outcome and Success Metrics
- A single scoped npm package named `@bvdm/delano` exists and exposes the `delano` binary.
- `delano install` materializes only the approved allowlist payload by default and aborts with a readable conflict report whenever an existing path would be overwritten without `--force`.
- `delano init`, `delano validate`, `delano status`, and `delano next` successfully delegate to the existing PM scripts instead of reimplementing their logic.
- The base install does not create, overwrite, or edit `AGENTS.md` or `CLAUDE.md` unless a future explicit opt-in path is implemented.
- The legacy `install-delano.sh` path remains available as a migration bridge and is not broken by the npm packaging work.

## Scope
### In Scope
- npm CLI scaffolding for `@bvdm/delano`
- package asset strategy and allowlist-driven install manifest
- conservative `delano install` behavior with `--target`, `--agents`, `--force`, and `--yes`
- wrapper commands for `init`, `validate`, `status`, and `next`
- Windows-first operator flow and required runtime assumptions (`bash`, `python3` or equivalent, `git`, `node`)
- documentation and verification needed to ship the v1 packaging layer safely
### Out of Scope
- a Delano-owned shell runtime or full execution harness
- a TUI, daemon, telemetry product, remote config plane, or multi-package split
- rewriting all shell/Python PM logic into JavaScript or TypeScript
- treating `.project` as package-owned mutable state after install
- silently overwriting existing `.project`, `.agents`, or top-level agent-entry files
- normal-base-install changes to `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, or `PI.md`

## Functional Requirements
- Add `package.json`, `bin/delano.js`, and a small JS CLI implementation under a source directory such as `src/cli/`.
- Package only the approved install payload and keep installation allowlist-driven.
- Embed and version runtime assets inside the npm package rather than fetching them from GitHub during normal CLI install.
- Implement conflict-first install planning that reports conflicting paths, their type (`file`, `directory`, or `symlink`), and why they conflict.
- Support `--force` so overwrites can happen only for paths inside the approved payload.
- Keep `.project` and `.agents` handling conservative: seed when safe, fail when conflicting, and do not assume package ownership after install.
- Preserve `install-delano.sh` as a working bridge path during this phase.

## Non-Functional Requirements
- Preserve the canonical Delano architecture and handbook boundaries.
- Prefer plain Node JavaScript unless TypeScript adds nearly zero operational complexity.
- Optimize the v1 UX for the current Windows flow without over-engineering perfect cross-platform abstraction.
- Keep the implementation audit-friendly through explicit manifests and readable conflict output.
- Avoid package behavior that creates a second runtime truth beside `.agents`.

## Hypotheses and Unknowns
- A thin Node CLI can package runtime assets and orchestrate the current PM scripts without needing to re-host their logic.
- The approved allowlist is stable enough to drive an install manifest and future upgrade reasoning.
- Windows users can rely on a documented `bash` plus Python plus Git plus Node toolchain for v1.
- The exact asset folder layout inside the package and the minimal manifest format still need to be chosen during implementation.
- The current `status.sh` output shape may need review because wrapper commands will expose PM-script behavior directly.

## Touchpoints to Exercise
- `README.md`
- `HANDBOOK.md`
- `docs/user-guide.md`
- `install-delano.sh`
- `.agents/scripts/pm/init.sh`
- `.agents/scripts/pm/validate.sh`
- `.agents/scripts/pm/status.sh`
- `.agents/scripts/pm/next.sh`
- `.agents/` runtime layout and adapter entry files
- the relationship between `.agents/` and `.claude/`

## Probe Findings
- The repository already matches the canonical Delano boundary model: `.project` is delivery truth, `.agents` is the shared runtime, `.claude` is compatibility-only, and `.delano` is optional UI.
- `.claude` exists in this repository as a directory mirror with the same file set as `.agents`, not as a symlink.
- The current PM surface already exists and is wrapper-friendly: `init.sh`, `validate.sh`, `status.sh`, and `next.sh` are stable script entrypoints under `.agents/scripts/pm/`.
- `install-delano.sh` is a sparse-checkout shell installer that currently installs a broader surface than the requested npm v1 design, including top-level agent-entry docs by default and `.claude` compatibility materialization.
- The context pack under `.project/context/` existed but was still placeholder-level before this setup pass and has now been grounded in the actual repository state.

## Footguns Discovered
- Repackaging the current shell installer as-is would violate the requested base install contract because it is more permissive and broader than the new allowlist.
- Wrapper commands will inherit PM-script behavior directly; existing output quirks need to be accepted deliberately or fixed deliberately, not obscured by the CLI.
- Treating `.project` as package-owned after install would break Delano's canonical truth model.
- Touching `AGENTS.md` or `CLAUDE.md` by default would violate the explicit packaging brief.

## Remaining Unknowns
- The cleanest manifest shape for describing packaged assets, optional agent docs, and future upgrade metadata.
- How much shared logic should be extracted between `delano install` and the legacy `install-delano.sh` bridge.
- Whether npm publish access for the `@bvdm` scope is available from this environment; local package verification is complete, but publishing remains an external account/scope permission follow-up.

## Dependencies
- Node and npm for packaging and CLI execution
- `bash`, `git`, and a usable Python runtime for wrapper command execution in v1
- the approved install payload list and top-level-doc opt-in rule from the project brief
- continued stability of the existing `.agents/scripts/pm/*` surface while the CLI layer is added

## Approval Notes
- `probe_required: false` because the requested architecture, allowed payload, command surface, and operating constraints are already explicit, and direct repo inspection bounded the remaining uncertainty sufficiently for planning.
- Spec is approved to unblock planning and breakdown; no separate prototype stage is required before decomposing the work.
