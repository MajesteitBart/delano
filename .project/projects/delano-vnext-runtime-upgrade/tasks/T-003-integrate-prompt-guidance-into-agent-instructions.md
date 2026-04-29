---
id: T-003
name: Integrate prompt guidance into agent instructions
status: ready
workstream: WS-A
created: 2026-04-29T21:57:00Z
updated: 2026-04-29T21:57:00Z
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
- [ ] `AGENTS.md` gives first-turn workflow, source-of-truth map, commands, completion rule, and safety boundaries.
- [ ] Adapter docs explain only adapter-specific behavior and point back to shared contracts.
- [ ] Instructions include validation/evidence rules and stopping conditions.
- [ ] Instructions avoid copying long prompt-guidance prose into the repo.

## Technical Notes

Relevant guidance to distill:
- Define outcomes and constraints rather than heavy process scripts.
- Keep personality/collaboration style separate and compact when needed.
- Preserve retrieval budgets, validation rules, and evidence requirements.
- Avoid legacy prompt bloat.

## Definition of Done
- [ ] Agent docs updated.
- [ ] No duplicated large prompt blocks across adapters.
- [ ] Docs reviewed for clarity and command accuracy.

## Evidence Log
- Pending.
