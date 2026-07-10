---
type: research_findings
project: viewer-openknowledge-parity
slug: t3code-handover-compatibility
created: 2026-07-10T09:48:22Z
updated: 2026-07-10T10:25:00Z
---

# Findings: T3 Code handover compatibility

## Source References

- T3 Code repository at commit `f61fa9499d96fee825492aba204593c37b27e0cb`: `README.md`, provider docs, `apps/server/src/cli/auth.ts`, `apps/server/src/cli/project.ts`, `apps/server/src/serverRuntimeState.ts`, `apps/server/src/orchestration/http.ts`, `apps/server/src/ws.ts`, `apps/web/src/components/ChatView.tsx`, and the orchestration/settings contracts.
- T3 Code upstream PR [#2424](https://github.com/pingdotgg/t3code/pull/2424), inspected with `gh pr view` and `gh pr diff`.
- [OpenAI Codex manual](https://developers.openai.com/codex/codex-manual.md), especially ChatGPT desktop app commands and deep links.
- [Anthropic Claude Code CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage).
- [Anthropic Claude Desktop deep-link reference](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link).
- Local checks: `t3 --help`, T3 Code Windows URL-protocol registration, installed process inspection, Delano handover server/UI/tests, and the T3 Code collaborative-browser preview status.

## Observations

- T3 Code is already a GUI over Codex and Claude (plus Cursor and OpenCode). It authenticates through the installed provider CLIs and can keep provider-backed sessions under the configured Codex or Claude home.
- T3 Code's published `t3` CLI starts or serves the local application and manages authentication/projects. It has no first-party thread command, but `t3 auth session issue --json` provides a short-lived administrative token and the running server exposes authenticated orchestration HTTP endpoints.
- Stable T3 Code v0.0.28 registers `t3code://` for its desktop renderer/OAuth flow, but its desktop single-instance handler only reveals the window. The current source does not parse an external URL into a new thread, workspace, or initial prompt.
- Upstream PR #2424 adds `t3://thread/<threadId>` handling for an existing T3 thread. The PR remains open and does not accept a prompt or workspace path, so Delano cannot safely depend on it.
- ChatGPT desktop keeps the `codex://` compatibility scheme and documents `codex://new?prompt=...&path=...`; Delano's existing Codex deep link is the correct native path. Codex CLI and Claude Code CLI both accept an initial prompt directly.
- Claude Desktop also documents `claude://code/new?q=...&folder=...`, but the current Delano Claude CLI launch remains a complete handover and is not a blocker for T3 Code support.
- Stable v0.0.28 exposes `project.create`, `thread.create`, and `thread.turn.start` through `/api/orchestration/dispatch`. Its HTTP handler dispatches directly to the engine, so it does not apply the web UI's `bootstrap.createThread` transform; external clients must create the thread before starting the turn.
- The newer source tree adds `/api/orchestration/shell`, but stable v0.0.28 falls through to the SPA for that path and its full snapshot takes roughly nine seconds with the current local history. The CLI therefore reads active projects from the local projection database when available and falls back to the authenticated API for remote/future environments.
- A real end-to-end run created T3 project `e3815116-b109-451b-bfd6-18d4bba20f00` for the new CLI repository and started thread `a1ec1e32-100b-40ca-812a-f474d657d304`; T3 persisted and auto-titled the thread.
- The smallest complete bridge is the sibling `t3code-cli` repository, installed as `t3code`, with Delano invoking `t3code --json handover --cwd <repo> --stdin --open auto`.

## Options Considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Use a native T3 new-thread deep link | Ideal one gesture; could carry workspace and prompt | Does not exist in stable T3 Code; upstream PR only opens existing thread IDs | Reject for now |
| Use T3 auth plus orchestration HTTP | Creates the project/thread and submits the prompt in one click | Requires compatibility handling around evolving alpha contracts | Implement behind a standalone, tested CLI |
| Launch `npx t3@latest` from the repo | Opens/bootstraps the workspace | Does not carry the prompt and may download/start a second server | Reject |
| Copy prompt, then open `t3code://app/` | Small Delano-only change | Requires manual paste and does not create/resolve the project | Superseded by CLI |

## Fold-Forward Candidates

| Finding | Target Artifact | Proposed Change |
| --- | --- | --- |
| T3 needs a callable handover surface | sibling `t3code-cli` repository | Maintain the standalone CLI, stable JSON contract, policy settings, tests, and doctor command. |
| Delano can invoke that surface without shell interpolation | `.delano/viewer/server.js`, UI domain, tests | Pass the prompt over stdin and return the created project/thread identifiers. |
| Desktop exact-thread navigation is not stable yet | `.delano/viewer/README.md`, CLI README | Reveal `t3code://app/` today; automatically use `t3://thread/<id>` if a future installed build registers it. |

## Open Questions

- Whether T3 Code will merge PR #2424 or add a first-party CLI/API for exact thread navigation.
- Whether a future stable release exposes worktree preparation outside the WebSocket UI path. The CLI currently asks callers to override to `--env-mode local` when T3's default is `worktree`.
