---
name: Agent Buttons
slug: delano-agent-buttons
owner: team
created: 2026-06-17T12:37:43Z
updated: 2026-06-17T14:02:00Z
---

# Decisions: Agent Buttons

## Active Decisions
- 2026-06-17: Agent buttons will generate prefilled prompts, not execute commands directly.
- 2026-06-17: Codex and Claude Code links will share one Delano prompt builder and use provider-specific URL builders.
- 2026-06-17: v1 will target Codex app and Claude Code terminal links, not Claude Code's VS Code URI handler.
- 2026-06-17: Lifecycle actions remain Delano CLI instructions with guardrails, preserving the viewer read-only boundary.
- 2026-06-17: v1 will expose one generic "Carry forward with agent" action plus provider choices, not separate lifecycle action buttons.
- 2026-06-17: v1 deeplink generation will happen server-side from a constrained action context; `/api/index` will not expose absolute repo root.
- 2026-06-17: v1 surfaces are limited to project overview, task detail, and blocked-task contexts.
- 2026-06-17: Preferred/default agent settings are deferred until after v1 usage feedback.
- 2026-06-17: Stable viewer URLs are deferred and are not a prerequisite for v1.
- 2026-06-17: The agent endpoint will return `provider`, `url`, `prompt`, and `warnings`.
- 2026-06-17: Prompt length policy is soft warning above 3,500 characters and hard fallback before Claude Code's 5,000-character `q` limit.
- 2026-06-17: Official deeplink URL shapes are sufficient for T-001; local desktop handler behavior is validated later in T-005.

## Superseded Decisions
- None.

## Open Decision Questions
- Which local desktop/browser combinations need explicit handler-missing fallback guidance?
