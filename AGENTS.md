# AGENTS.md

Delano is agent-agnostic. This file is the first operational handoff for every coding agent in this repository.

## First-turn workflow

1. Read `AGENTS.md`, then the adapter note for your runtime in `.agents/adapters/<agent>/README.md`.
2. Inspect current state before changing anything: `git status --short --branch`, the relevant `.project/projects/<project>/` contract, and the files you intend to touch.
3. Choose the smallest task-safe change. If the contract is stale, update the task evidence or decisions before implementing around it.
4. Run the smallest meaningful validation before claiming completion.
5. Record evidence in the task, then commit and push only when the assigned workflow asks for it.

## Source-of-truth map

- Product/process handbook: `HANDBOOK.md`
- Delivery state and contracts: `.project/`
- Runtime scripts, hooks, rules, and skills: `.agents/`
- Adapter-specific notes: `.agents/adapters/<agent>/README.md`
- Compatibility runtime: `.claude/` mirrors `.agents/` for agents that still expect Claude-style paths
- Package install allowlist: `assets/install-manifest.json`
- Generated npm payload: `assets/payload/` after `npm run build:assets`

## Core commands

- Validate project contracts: `bash .agents/scripts/pm/validate.sh`
- Run package/runtime tests: `npm test`
- Rebuild packaged runtime assets: `npm run build:assets`
- Check package/manifest drift: `npm run check:package-manifest`
- Find next project task: `bash .agents/scripts/pm/next.sh`
- Show project status: `bash .agents/scripts/pm/status.sh`

## Completion rule

A task is not done until the implementation or contract change is present, validation evidence is recorded in the task or update log, and the working tree state is understood. Say what passed, what was not run, and what remains blocked.

## Safety boundaries

- Do not take destructive actions, force-push, rewrite shared history, or apply remote writes unless the task explicitly asks for it.
- Keep logs privacy-safe: raw prompts are opt-in only, and committed logs must pass `.agents/scripts/check-log-safety.sh`.
- Do not leak local absolute paths in docs, contracts, or hook output.
- Keep adapter entrypoint files thin. Agent-specific behavior belongs in `.agents/adapters/<agent>/`; shared behavior belongs here or in `.agents/`.
