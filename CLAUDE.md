# AGENTS.md

Read `AGENTS.md` first. Keep this file thin unless Claude-specific compatibility requires more detail.

Delano is agent-agnostic. This file is the first operational handoff for every coding agent in this repository.

## First-turn workflow

1. Read `AGENTS.md`, then the adapter note for your runtime in `.agents/adapters/<agent>/README.md`.
2. Inspect current state before changing anything: `git status --short --branch`, the relevant `.project/projects/<project>/` contract, and the files you intend to touch.
3. Choose the smallest task-safe change. If the contract is stale, update the task evidence or decisions before implementing around it.
4. Run the smallest meaningful validation before claiming completion.
5. Record evidence in the task, then commit and push only when the assigned workflow asks for it.

## Delano workflow

Use the full flow for features, contract changes, or material improvements:

1. **Discovery**: define the measurable outcome in `spec.md` with `discovery-skill`.
2. **Prototype Probe**: time-box only when uncertainty is high, then record findings back to the spec.
3. **Planning**: capture architecture, milestones, rollout, and rollback in `plan.md` with `planning-skill`.
4. **Breakdown**: create atomic tasks with binary acceptance criteria and acyclic dependencies using `breakdown-skill`.
5. **Synchronization**: reconcile Linear or GitHub state when tracker state is involved using `sync-skill`.
6. **Execution**: work dependency-safe tasks inside workstream boundaries and record evidence in `updates/` with `execution-skill`.
7. **Quality Ops**: run risk-based checks and verify acceptance before closure with `quality-skill`.
8. **Closeout**: compare the result to the outcome, update project memory when appropriate, and close the loop with `closeout-skill`.

For small local fixes, follow the first-turn workflow. Update delivery or context files only when scope, architecture, status, or evidence changes.

Prefer the Delano CLI for `.project` lifecycle changes instead of hand-editing frontmatter. The CLI applies scoped rollups so projects, workstreams, and tasks keep moving consistently.

When intent is unclear, use `delano research <project-slug> <research-slug> --title "<title>" --question "<question>" --json` before changing executable contracts.

## Source-of-truth map

- Product/process handbook: `HANDBOOK.md`
- Delivery state and contracts: `.project/`
- Runtime scripts, hooks, rules, and skills: `.agents/`
- Adapter-specific notes: `.agents/adapters/<agent>/README.md`
- Compatibility runtime: `.claude/` is a generated mirror of `.agents/` for agents that still expect Claude-style paths; never edit it directly. Edit `.agents/` and run `npm run sync:claude-mirror`.
- Package install allowlist: `assets/install-manifest.json`
- Generated npm payload: `assets/payload/` after `npm run build:assets`

## Core commands

- Help: `delano help`
- Open project state: `delano status --open --brief`
- Validate project contracts: `delano validate` or `bash .agents/scripts/pm/validate.sh` (contracts-only; passes on a fresh clone)
- Validate for release: `bash .agents/scripts/pm/validate.sh --release` (adds package payload drift; needs `npm run build:assets` first)
- Inspect next available work: `delano next -- --all` or `bash .agents/scripts/pm/next.sh`
- Launch the local contract UI: `delano viewer`
- Run package/runtime tests: `npm test`
- Rebuild packaged runtime assets: `npm run build:assets`
- Check package/manifest drift: `npm run check:package-manifest`
- Show project status through the runtime script: `bash .agents/scripts/pm/status.sh`

## Lifecycle commands

Project commands:

- `delano project create <slug> --name "<name>" --owner <owner>`: create `spec.md`, `plan.md`, and `decisions.md` from templates.
- `delano project show <slug> --json`: inspect a project contract.
- `delano project start|close|block|defer|update <slug> --reason "<text>"`: patch project lifecycle without regenerating templates.

Workstream commands:

- `delano workstream add <project-slug> <WS-ID> --name "<name>" --owner <owner>`: add a workstream from template.
- `delano workstream show <project-slug> <WS-ID> --json`: inspect a workstream.
- `delano workstream start|close|block|defer|update <project-slug> <WS-ID> --reason "<text>"`: patch workstream lifecycle.

Task commands:

- `delano task add <project-slug> <T-ID> --name "<name>" --workstream <WS-ID>`: add a task from template.
- `delano task open|start|close|block|defer|update <project-slug> <T-ID> --reason "<text>"`: patch one task and apply scoped lifecycle rollups.
- Use `--evidence "<text>"` when closing tasks and `--message "<text>"` for task updates.

Progress updates:

- `delano update add <project-slug> --message "<text>" --task <T-ID> --stream <WS-ID>`: add evidence to `updates/`.

## Conventions

- Avoid hard-wrapping Markdown prose.

## Completion rule

A task is not done until the implementation or contract change is present, validation evidence is recorded in the task or update log, and the working tree state is understood. Report completion as `done`, `partial`, or `blocked`, with evidence or the next concrete pickup.

Run lint, type-check, tests, build, GUI checks, or `delano validate` when relevant to the changed surface. If a check is skipped or cannot run, say why. Say what passed, what was not run, and what remains blocked.

Delegate browser testing, GUI smoke checks, and screenshot capture to the Codex CLI (`codex exec`) instead of spawning browser-automation subagents; see `.agents/rules/browser-delegation.md`.

## Safety boundaries

- Do not take destructive actions, force-push, rewrite shared history, or apply remote writes unless the task explicitly asks for it.
- Prefer recoverable edits and narrow diffs.
- Do not revert user changes unless explicitly asked.
- Confirm before outbound or public actions such as production deploys, public comments, or tracker mutations.
- Keep logs privacy-safe: raw prompts are opt-in only, and committed logs must pass `.agents/scripts/check-log-safety.sh`.
- Do not leak local absolute paths in docs, contracts, or hook output.
- Keep adapter entrypoint files thin. Agent-specific behavior belongs in `.agents/adapters/<agent>/`; shared behavior belongs here or in `.agents/`.
