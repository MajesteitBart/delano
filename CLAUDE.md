# Claude Adapter

Read `AGENTS.md` first. Keep this file thin unless Claude-specific compatibility requires more detail.

`AGENTS.md` is the source of truth for the first-turn workflow, Delano workflow, source-of-truth map, core commands, lifecycle commands, completion rule, and safety boundaries.

Claude-specific compatibility notes:

- Use `.agents/adapters/claude/README.md` for runtime reminders.
- Treat `.claude/` as a generated mirror of `.agents/`; edit `.agents/` and run `npm run sync:claude-mirror`.
- Delegate browser testing, GUI smoke checks, and screenshot capture to the Codex CLI as described in `AGENTS.md` and `.agents/rules/browser-delegation.md`.
