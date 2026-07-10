---
type: research_progress
project: viewer-openknowledge-parity
slug: t3code-handover-compatibility
created: 2026-07-10T09:48:22Z
updated: 2026-07-10T09:48:22Z
---

# Progress: T3 Code handover compatibility

## 2026-07-10T09:48:22Z

- Opened research intake for project `viewer-openknowledge-parity`.
- Primary question: Can Delano hand over viewer work into T3 Code, ChatGPT/Codex, Codex CLI, and Claude Code using native session/deep-link mechanisms, and what is the smallest bridge if any is missing?

## 2026-07-10 Research and implementation

- Read the T3 Code docs and source at commit `f61fa9499d96fee825492aba204593c37b27e0cb` and inspected its stable Windows protocol registration.
- Verified native ChatGPT/Codex and Claude CLI/deep-link capabilities against their current official references.
- Inspected open T3 Code PR #2424 and confirmed it cannot create a new prompted thread.
- Chose copy-prompt plus `t3code://app/` over private T3 orchestration APIs.
- Added the T3 Code handover target to the server contract, document/task menus, annotation handover, agent mark, README, and server tests while preserving the existing uncommitted viewer work.

## Validation Evidence

- Standalone CLI: `pnpm check` passes typecheck, 8 Vitest cases, and build.
- Live T3 v0.0.28: `doctor` passed; Delano project resolution completed in about 0.4 seconds; dry run resolved project `9867dcad-bd53-4b37-af74-6c656b739e7c`; real project/thread dispatch persisted project `e3815116-b109-451b-bfd6-18d4bba20f00` and thread `a1ec1e32-100b-40ca-812a-f474d657d304`.
- Delano bridge: 11 viewer server tests pass, including a fake-CLI integration test that verifies exact arguments and prompt-over-stdin behavior.
- Viewer UI: typecheck and targeted ESLint pass.

## Handoff Summary

- The copy/paste bridge is superseded. Delano now calls the installed `t3code` CLI and returns the created T3 project/thread identifiers.
- Exact-thread desktop navigation remains upstream-limited; stable T3 Code is revealed after the thread is created.

## 2026-07-10T10:25:00Z — Research correction and completed bridge

- Reopened the rejected orchestration option after inspecting T3's scoped session CLI and HTTP contracts in detail.
- Built and globally linked the sibling `t3code-cli` repository.
- Added create/existing project policy, repo/folder workspace policy, T3 setting resolution, JSON output, doctor/config/project/thread/request commands, short-lived session revocation, and failure cleanup.
- Replaced Delano's copied-prompt T3 behavior with a real stdin-based CLI handover.
- Concluded the intake after mocked, live, and viewer integration validation.
