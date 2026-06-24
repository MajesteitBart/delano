---
id: WS-B
name: WS-B Prompt And Command Presets
owner: product
status: planned
created: 2026-06-17T12:38:07Z
updated: 2026-06-17T14:02:00Z
---

# Workstream: WS-B Prompt And Command Presets

## Objective
Define concise v1 prompts that turn project, task, and blocker viewer context into safe Delano CLI-oriented agent instructions.

## Owned Files/Areas
- Prompt/action definitions in the viewer app or helper module
- V1 carry-project-forward, carry-task-forward, and investigate-blocker prompt mapping
- Copyable fallback prompt text

## Dependencies
- WS-A action context shape.
- Existing Delano lifecycle commands.
- Oracle-reviewed v1 scope for project, task, and blocker contexts.

## Risks
- Prompt text becomes too long or too vague.
- Presets suggest close/reopen/block without enough evidence or required arguments.
- Future lifecycle presets leak into v1 UI before usage feedback supports them.

## Handoff Criteria
- Prompt presets cover v1 project, task, and blocker actions.
- Future lifecycle presets are documented but not wired into v1 UI.
- Prompts are command-first and identifier-based.
- Guardrails are explicit for task carry-forward and blocker investigation flows.
- Prompt length policy is deterministic: soft warning above 3,500 characters and hard fallback before Claude Code's 5,000-character `q` limit.
