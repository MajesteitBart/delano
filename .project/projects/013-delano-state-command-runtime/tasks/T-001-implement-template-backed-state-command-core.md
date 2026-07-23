---
id: T-001
name: Implement template-backed state command core
status: done
workstream: WS-A
created: 2026-05-12T11:25:19Z
updated: 2026-05-12T11:51:28Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [src/cli/index.js, test/cli.test.js]
parallel: false
priority: high
estimate: L
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005]
---

# Task: Implement template-backed state command core

## Description

Add native CLI state commands for project, workstream, task, and update operations. Creation/add commands must render from `.project/templates`; lifecycle commands must patch existing artifacts and apply scoped rollups.

## Acceptance Criteria
- [x] `project create` renders `spec.md` and `plan.md` from `.project/templates`.
- [x] `workstream add` renders from `.project/templates/workstream.md`.
- [x] `task add` renders from `.project/templates/task.md`.
- [x] `update add` renders from `.project/templates/progress-update.md`.
- [x] Lifecycle commands patch existing artifacts and preserve non-frontmatter markdown.
- [x] Focused CLI tests pass.

## Traceability
- Story: US-001, US-002, US-003
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004, AC-005

## Technical Notes

- Keep `delano validate` as the full audit gate.
- Prefer extracting helper logic from `src/cli/index.js` if the command implementation becomes large.
- Do not touch unrelated dirty viewer CSS.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-05-12T11:51:28Z: Implemented template-backed project/workstream/task/update commands; added focused CLI coverage; node --test test/cli.test.js, node --test test/package.test.js, bash .agents/scripts/pm/validate.sh, and npm test passed.
- 2026-05-12T11:25:19Z: Task opened after correcting the workflow to use Delano project contracts before continuing CLI implementation.
