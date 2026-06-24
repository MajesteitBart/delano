---
id: T-004
name: Expose context packs to viewer and agent flows
status: blocked
workstream: WS-C
created: 2026-06-24T21:51:46Z
updated: 2026-06-24T21:51:46Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002, T-003]
conflicts_with: [.delano/viewer/server.js, .delano/viewer/public/app.jsx, .project/projects/delano-agent-buttons]
parallel: true
priority: medium
estimate: M
story_id: US-003
acceptance_criteria_ids: [AC-005, AC-006, AC-007]
blocked_owner: team
blocked_check_back: 2026-06-26
---

# Task: Expose context packs to viewer and agent flows

## Description

Integrate the context reader where it removes duplication or improves agent handoff. The first target is reference-based integration: viewer/server or agent-button prompts should be able to point agents at stable `delano context` commands/profiles instead of embedding full context dumps.

## Acceptance Criteria

- [ ] Any viewer/server context metadata endpoint uses the shared context reader instead of custom path walking.
- [ ] Agent-button prompt templates can reference appropriate context profiles/commands when carrying work forward.
- [ ] Deeplink prompts do not embed full `.project/context` content by default.
- [ ] Existing viewer context browsing still works.
- [ ] Viewer remains read-only and no context action writes `.project` files.
- [ ] UI or prompt wording explains the context profile being suggested.
- [ ] Integration is small enough not to reopen the agent-buttons v1 scope explosion.

## Traceability

- Story: US-003
- Acceptance criteria: AC-005, AC-006, AC-007

## Technical Notes

- This may land as a minimal prompt-builder change rather than visible UI.
- If it touches `.project/projects/delano-agent-buttons`, preserve that project's narrowed v1 safety contract.
- Avoid adding row-level context UI unless implementation evidence shows it is needed.

## Definition of Done

- [ ] Implementation complete or explicitly deferred if CLI/library already satisfies v1
- [ ] Tests/smoke checks pass for any touched viewer or prompt surfaces
- [ ] Read-only boundary verified
- [ ] Docs updated if user-facing behavior changes

## Evidence Log

- 2026-06-24T21:51:46Z: Waiting for the context reader library and CLI shape from T-002/T-003.
- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
