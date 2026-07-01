# Claude adapter

## Start here

1. Read root `AGENTS.md` first.
2. Use this note only for Claude-specific path behavior.
3. Inspect `git status --short --branch` and the assigned `.project` contract before editing.

## Runtime paths

- Canonical runtime: `.agents/`
- Claude compatibility path: `.claude/` mirrors `.agents/` where available
- Delivery contracts: `.project/`

## Commands

- `bash .agents/scripts/pm/validate.sh`
- `npm test`
- `npm run build:assets`
- `npm run check:package-manifest`

## Delegation

- Do not spawn browser-automation subagents or drive browser tools for routine verification.
- Hand browser testing, GUI smoke checks, and screenshots to the Codex CLI: `codex exec "<scoped instruction>"` (see `.agents/rules/browser-delegation.md`).

## Completion and safety

Record evidence in the task or update log before marking work done. Do not rely on `.claude/` as a separate source of truth, do not commit unsafe logs, and do not leak local absolute paths in output.
