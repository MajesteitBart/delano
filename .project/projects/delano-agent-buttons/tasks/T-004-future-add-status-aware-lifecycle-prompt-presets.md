---
id: T-004
name: Future: add status-aware lifecycle prompt presets
status: deferred
workstream: WS-B
created: 2026-06-17T12:39:05Z
updated: 2026-06-17T13:47:54Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002]
conflicts_with: [.delano/viewer/public/app.jsx]
parallel: true
priority: medium
estimate: M
story_id: US-001
acceptance_criteria_ids: [AC-004, AC-006]
---

# Task: Future: add status-aware lifecycle prompt presets

## Description

Future work: map viewer state to safe prompt presets for closing with evidence, blocking, reopening, validating, deferring, or starting tasks. This depends on v1 usage feedback and should not be wired into the first agent-buttons UI.

## Acceptance Criteria

- [ ] Ready/planned tasks generate start prompts with dependency checks.
- [ ] In-progress tasks generate close-with-evidence prompts only when acceptance criteria and validation evidence are available.
- [ ] Blocked tasks generate investigate/reopen/re-block prompts with owner and check-back guardrails.
- [ ] Done/deferred tasks generate review/reopen prompts rather than eager mutation prompts.
- [ ] Lifecycle presets are not added to top-level v1 UI labels.
- [ ] Future wiring depends on usage feedback from the v1 generic carry-forward flow.

## Traceability
- Story: US-001
- Acceptance criteria: AC-004, AC-006

## Technical Notes

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log

- 2026-06-17T13:47:54Z: Oracle review moved lifecycle-specific presets out of v1; keep as future work after v1 usage feedback.

- 2026-06-17T12:42:04Z: Waiting for T-002 to define the shared Delano prompt template model.
- 2026-06-17T12:39:05Z: Created from .project/templates/task.md by `delano task add`.
