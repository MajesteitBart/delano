# Project Structure

Document major repository boundaries and ownership.

## Canonical Boundaries
- `HANDBOOK.md`: canonical operating model, governance, contracts, and workflow stages.
- `.project/`: delivery truth for project specs, plans, workstreams, tasks, updates, decisions, templates, registry state, and shared context.
- `.agents/`: canonical runtime assets shared across supported coding agents.
- `.claude/`: compatibility mirror of `.agents/`; present for Claude-style path expectations only.
- `.delano/`: optional presentation layer; never source of process truth.

## Runtime Areas
- `.agents/scripts/pm/`: critical operator commands such as `init.sh`, `validate.sh`, `status.sh`, `next.sh`, and `blocked.sh`.
- `.agents/skills/`: stage skills and supporting runbooks/templates used to structure work.
- `.agents/rules/` and `.agents/hooks/`: guardrails and runtime instrumentation.
- `.agents/adapters/<agent>/`: thin agent-specific notes for Claude, Codex, OpenCode, and Pi.

## Documentation Areas
- `README.md`: short product/repo overview.
- `docs/`: operator-facing guidance that expands on the handbook and runtime.
- Top-level adapter entry files such as `AGENTS.md`, `CLAUDE.md`, and `CODEX.md`: thin pointers into the canonical model.

## Working Notes
- `tmp/` is scratch space and is not part of Delano's canonical runtime or delivery truth.
