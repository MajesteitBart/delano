# Delano

Delano is being rebuilt from the ground up.

Start here:
- [`HANDBOOK.md`](./HANDBOOK.md)

`HANDBOOK.md` is the canonical source of truth for this repository.

## Environment bootstrap

The handbook runtime scaffold is initialized in this repository:

- `.project/` (delivery truth)
- `.agents/` (runtime + agent adapters)
- `.claude/` (compatibility symlink to `.agents/runtime`)
- `.delano/` (optional UI layer)

Useful commands:

```bash
# Validate the environment (includes skill-pack checks)
bash .claude/scripts/pm/validate.sh

# Create a new delivery project scaffold
bash .claude/scripts/pm/init.sh <slug> "<Project Name>" <owner> <lead>

# Portfolio status snapshot
bash .claude/scripts/pm/status.sh
```

## Installer (for other repos)

Run the interactive installer:

```bash
./install-delano.sh
```

It asks which coding agent(s) you use (multi-select) and installs the matching Delano adapter set from this repository.

## Skill packs

Execution-ready skill contracts live in `.agents/runtime/skills/*` (available through `.claude/skills/*` too).
Each skill includes:
- `SKILL.md` contract
- `references/runbook.md`
- `templates/*.md`
