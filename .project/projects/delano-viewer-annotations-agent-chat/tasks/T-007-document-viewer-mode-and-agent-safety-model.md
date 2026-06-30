---
id: T-007
name: Document viewer mode and agent safety model
status: ready
workstream: WS-C
created: 2026-06-30T14:12:17Z
updated: 2026-06-30T14:24:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-003, T-004, T-005]
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Document viewer mode and agent safety model

## Description

Document how annotation mode, chat mode, write application, and context-reader prompts fit together for operators and future agents.

## Acceptance Criteria

- [ ] Docs distinguish view-only, annotate, chat, and apply modes.
- [ ] Docs show how agents should consume annotation attachments and run delano context read profiles.
- [ ] Docs include validation and rollback commands for the feature.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Documentation should preserve clear modes: view-only, annotate, chat, preview/apply, and optional share.
- Agent instructions should prefer `delano context read --profile implementation` plus selected annotation attachments over stuffing raw context into prompts.
- Validation evidence should name both contract validation and any viewer/browser checks used for implementation tasks.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-30T14:12:17Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from context-reader handoff direction and viewer annotation/chat plan.
