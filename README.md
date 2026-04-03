# Delano

Delano is an agent-agnostic, runtime-guided, skill-driven delivery system.

## WHY

AI-assisted delivery is fast, but it easily becomes inconsistent.

Delano exists to keep teams fast **and** reliable by giving one shared way to move from business outcomes to specs, tasks, code, and evidence.

It is designed to reduce:
- execution drift between planning and implementation
- tool-specific lock-in
- undocumented decisions and low-trust delivery flow

## WHAT

Delano is a spec-first runtime for software delivery, backed by explicit file contracts and deterministic scripts.

Core pieces:
- `HANDBOOK.md` — canonical operating model and governance
- `.project/` — delivery truth (projects, tasks, context, updates, decisions)
- `.agents/` — shared runtime (scripts, rules, hooks, skills, adapters)
- `.claude/` — compatibility mirror for Claude-style paths (symlink where supported, directory mirror otherwise)
- `.delano/` — optional UI layer

Probe-aware delivery is part of the operating model: draft the spec, make the probe decision explicit, and only approve once uncertainty is retired or consciously accepted.

Supported adapters:
- Claude Code
- Codex CLI
- OpenCode
- Pi coding agent

## HOW

### Quick start (inside a Delano repo)

```bash
# 1) Validate the runtime and required assets
bash .agents/scripts/pm/validate.sh

# 2) Create a new delivery project scaffold
bash .agents/scripts/pm/init.sh <slug> "<Project Name>" <owner> <lead>

# 3) See portfolio/project status
bash .agents/scripts/pm/status.sh

# 4) Get next executable tasks
bash .agents/scripts/pm/next.sh
```

### Daily operating loop

1. Keep project intent and execution synced in `.project/projects/<slug>/`.
2. Execute work through workstreams and atomic tasks (`tasks/T-xxx.md`).
3. Record progress/blockers in `updates/*.md`.
4. Re-run validation before merge/handoff:
   ```bash
   bash .agents/scripts/pm/validate.sh
   ```

### Install Delano into another repository

Run the installer from this repository:

```bash
./install-delano.sh
```

Non-interactive example:

```bash
./install-delano.sh --target /path/to/repo --agents claude,codex --yes
```

### Read next

- `docs/user-guide.md` for the user-facing overview
- `HANDBOOK.md` for full operating semantics
- `.agents/scripts/README.md` for runtime script inventory
- `AGENTS.md` and adapter entrypoints (`CLAUDE.md`, `CODEX.md`, etc.) for agent-specific bootstraps
