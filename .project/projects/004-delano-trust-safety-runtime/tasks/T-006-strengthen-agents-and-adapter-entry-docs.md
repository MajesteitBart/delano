---
id: T-006
name: Strengthen AGENTS and adapter entry docs
status: done
workstream: WS-D
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:15:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Strengthen AGENTS and adapter entry docs

## Description
Make AGENTS.md and adapter pointers operational: first-turn workflow, source-of-truth map, commands, completion rule, and safety boundaries.

## Acceptance Criteria
- [x] Current repo state has been inspected before implementation starts.
- [x] The delivered change is represented in Delano runtime assets, project contracts, validation, fixtures, or docs as appropriate.
- [x] The change is validated with the smallest meaningful command or fixture.
- [x] Evidence is recorded in this task or a task update before the task is marked done.

## Technical Notes
- This task came from the Delano next-step roadmap review.
- Keep behavior additive or dry-run-first when the task touches validation, remote sync, logs, or write-capable commands.
- Do not claim completion from documentation alone unless the task is explicitly documentation-only.

## Definition of Done
- [x] Implementation or contract creation complete
- [x] Validation or focused test passes
- [x] Review complete
- [x] Docs updated where behavior changes

## Evidence Log
- 2026-04-28T23:14:00Z: Task created from roadmap review; implementation evidence pending.
- 2026-04-29T23:15:00Z: Inspected current agent entry docs (`AGENTS.md`, adapter entrypoints, `.agents/README.md`, and `.agents/adapters/*/README.md`). Strengthened the operational handoff with first-turn workflow, source-of-truth map, core commands, completion rule, and safety boundaries. Added `scripts/check-agent-entry-docs.mjs`, `npm run check:agent-entry-docs`, PM validation wiring, and `node --test` coverage so the handoff guidance stays present. Validation passed: `npm run build:assets`, `bash .agents/scripts/pm/validate.sh`, and `npm test` (13/13).
