# Delano

Delano is being rebuilt from the ground up.

Start here:
- [`HANDBOOK.md`](./HANDBOOK.md)

`HANDBOOK.md` is the canonical source of truth for this repository.

## Environment bootstrap

The handbook runtime scaffold is initialized in this repository:

- `.project/` (delivery truth)
- `.claude/` (skills, scripts, rules, hooks)
- `.delano/` (optional UI layer)

Useful commands:

```bash
# Validate the environment
bash .claude/scripts/pm/validate.sh

# Create a new delivery project scaffold
bash .claude/scripts/pm/init.sh <slug> "<Project Name>" <owner> <lead>

# Portfolio status snapshot
bash .claude/scripts/pm/status.sh
```
