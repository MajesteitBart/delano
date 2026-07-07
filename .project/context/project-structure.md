# Project Structure

Document major repository boundaries and ownership. Treat these paths as repo-relative; do not copy local absolute paths into contracts or docs.

## Canonical Boundaries
- `HANDBOOK.md`: canonical operating model, governance, contracts, and workflow stages.
- `.project/`: delivery truth for project specs, plans, workstreams, tasks, updates, decisions, templates, registry state, and shared context.
- `.agents/`: canonical runtime assets shared across supported coding agents.
- `.claude/`: generated compatibility mirror of `.agents/`; present for Claude-style path expectations only and updated through mirror tooling.
- `.delano/`: local presentation and review layer; useful for reading, annotating, and handing over work, but never the source of process truth.
- `bin/`, `src/cli/`, `scripts/`, `assets/`, and `test/`: npm package, CLI implementation, validation/build scripts, generated payload inputs, and automated tests.

## Runtime Areas
- `.agents/scripts/pm/`: critical operator commands such as `init.sh`, `validate.sh`, `status.sh`, `next.sh`, and `blocked.sh`.
- `.agents/skills/`: stage skills and supporting runbooks/templates used to structure work.
- `.agents/rules/` and `.agents/hooks/`: guardrails and runtime instrumentation.
- `.agents/adapters/<agent>/`: thin agent-specific notes for Claude, Codex, OpenCode, and Pi.
- `.delano/viewer/server.js`: local guarded viewer server and API boundary.
- `.delano/viewer/ui/src/`: source React/TypeScript app with app hooks, domain helpers, markdown rendering, shadcn UI components, molecules, organisms, and pages.
- `.delano/viewer/public/assets/`: built viewer assets shipped in the npm payload after `npm run build:assets`.
- `.project/viewer/`: repo-local viewer review artifacts such as annotations and handover files.

## Documentation Areas
- `README.md`: short product/repo overview.
- `docs/`: operator-facing guidance that expands on the handbook and runtime.
- Top-level adapter entry files such as `AGENTS.md`, `CLAUDE.md`, and `CODEX.md`: thin pointers into the canonical model.
- `.project/context/`: current handoff memory for agents and maintainers; refresh it when project status, architecture, validation, or viewer behavior changes.

## Working Notes
- `tmp/` is scratch space and is not part of Delano's canonical runtime or delivery truth.
- Generated assets and mirrors should be changed through the relevant build or sync command so source and payload stay consistent.
