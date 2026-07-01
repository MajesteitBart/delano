---
id: T-014
name: Add work-dispatch handover on tasks and workstreams
status: done
workstream: WS-C
created: 2026-07-01T23:15:05Z
updated: 2026-07-01T23:22:07Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Add work-dispatch handover on tasks and workstreams

## Description

Handover on task and workstream contracts should dispatch work, not only carry annotation feedback: trigger an agent to start the work, or ask an agent to review delivered work against the contract.

## Acceptance Criteria
- [x] `POST /api/handover` accepts `intent: "start" | "review"`; start prompts reference the contract directly (no handover file), review prompts include the annotation handover file only when captured feedback exists.
- [x] Prompts are role-aware: tasks are implemented to their acceptance criteria, workstreams pick up dependency-safe open tasks, review verifies acceptance criteria and the evidence log.
- [x] Task and workstream documents show a Hand over menu next to Review with start/review actions for Codex (deep link) and Claude Code (terminal) plus copy-command fallbacks.
- [x] The Tasks and Workstreams pages show a per-row agent button with the same menu and inline status feedback.
- [x] Server tests cover start and review intents, including the no-annotations review case, and the full suite passes.

## Traceability
- Story: US-003
- Acceptance criteria: AC-003

## Technical Notes

The client shares one handover helper (`lib/domain/handover.ts`) across the review panel, the reader header menu, and list rows: agent preference in localStorage, codex deep link as the default Codex action, terminal launch for Claude Code, clipboard copy as the universal fallback.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-01T23:22:07Z: Implemented start/review intents on /api/handover with role-aware prompts, shared client handover helper, Hand over menu on task/workstream documents, and per-row agent buttons on the Tasks and Workstreams pages. Server tests cover both intents including the no-annotations review case. Codex CLI browser verification passed 5/5: agent column and row buttons on both list pages, menu structure, copy-command status feedback, and the document header menu.

- 2026-07-01T23:15:05Z: Owner follow-up: handover buttons on tasks and workstreams should trigger the work or request review of delivered work, not only carry annotation feedback.
- 2026-07-01T23:15:05Z: Created from .project/templates/task.md by `delano task add`.
