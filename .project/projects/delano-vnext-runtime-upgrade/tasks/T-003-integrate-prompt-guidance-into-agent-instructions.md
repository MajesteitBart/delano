---
id: T-003
name: Integrate prompt guidance into agent instructions
status: done
workstream: WS-A
created: 2026-04-29T21:57:00Z
updated: 2026-04-30T02:52:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [AGENTS.md, CODEX.md, CLAUDE.md, OPENCODE.md, PI.md, .agents/adapters/**]
parallel: false
priority: high
estimate: M
---

# Task: Integrate prompt guidance into agent instructions

## Description

Update root and adapter instructions to follow current OpenAI prompt guidance: short, outcome-first, operationally explicit, and not duplicated across adapters.

## Acceptance Criteria
- [x] `AGENTS.md` gives first-turn workflow, source-of-truth map, commands, completion rule, and safety boundaries.
- [x] Adapter docs explain only adapter-specific behavior and point back to shared contracts.
- [x] Instructions include validation/evidence rules and stopping conditions.
- [x] Instructions avoid copying long prompt-guidance prose into the repo.

## Technical Notes

Relevant guidance to distill:
- Define outcomes and constraints rather than heavy process scripts.
- Keep personality/collaboration style separate and compact when needed.
- Preserve retrieval budgets, validation rules, and evidence requirements.
- Avoid legacy prompt bloat.

## Definition of Done
- [x] Agent docs updated.
- [x] No duplicated large prompt blocks across adapters.
- [x] Docs reviewed for clarity and command accuracy.

## Evidence Log
- 2026-04-30T02:52:00Z: Verified root and adapter instruction updates: `AGENTS.md` now gives first-turn workflow, source-of-truth map, commands, completion rule, validation/evidence rules, stopping/safety boundaries; `CODEX.md`, `CLAUDE.md`, `OPENCODE.md`, and `PI.md` remain thin adapter pointers. Validation passed: agent entry doc check via `bash .agents/scripts/pm/validate.sh`; `npm test`.
