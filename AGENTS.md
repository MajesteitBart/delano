# AGENTS.md

Delano is agent-agnostic.

## Canonical truth

- Process and contracts: `HANDBOOK.md`
- Delivery state and artifacts: `.project/`

## Adapter model

- Shared runtime lives directly in `.agents/` (`scripts`, `rules`, `hooks`, `skills`, `logs`)
- Agent-specific adapters live in `.agents/adapters/<agent>/`
- `.claude` is a compatibility symlink to `.agents`
- Agent entrypoint files (`CLAUDE.md`, `CODEX.md`, etc.) should stay thin and point here

## Operating rule

Regardless of coding agent:
- read/write the same `.project` contracts
- use the same status model and evidence discipline
- keep sync and quality gates consistent with the handbook
