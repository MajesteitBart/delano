---
id: T-004
name: Expose context packs to viewer and agent flows
status: done
workstream: WS-C
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:35:29Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002, T-003]
conflicts_with: [.delano/viewer/server.js, .delano/viewer/public/app.jsx]
parallel: true
priority: medium
estimate: M
story_id: US-003
acceptance_criteria_ids: [AC-005, AC-006, AC-007]
---

# Task: Expose context packs to viewer and agent flows

## Description

Integrate the context reader where it removes duplication or improves agent handoff. The first target is reference-based integration: viewer/server or agent-button prompts should be able to point agents at stable `delano context` commands/profiles instead of embedding full context dumps.

## Acceptance Criteria

- [x] Any viewer/server context metadata endpoint uses the shared context reader instead of custom path walking.
- [x] Agent-button prompt templates can reference appropriate context profiles/commands when carrying work forward.
- [x] Deeplink prompts do not embed full `.project/context` content by default.
- [x] Existing viewer context browsing still works.
- [x] Viewer remains read-only and no context action writes `.project` files.
- [x] UI or prompt wording explains the context profile being suggested.
- [x] Integration is small enough not to reopen the agent-buttons v1 scope explosion.

## Traceability

- Story: US-003
- Acceptance criteria: AC-005, AC-006, AC-007

## Technical Notes

- This may land as a minimal prompt-builder change rather than visible UI.
- Keep any future agent-button prompt work out of this slice unless a live project contract owns it.
- Avoid adding row-level context UI unless implementation evidence shows it is needed.

## Definition of Done

- [x] Implementation complete or explicitly deferred if CLI/library already satisfies v1
- [x] Tests/smoke checks pass for any touched viewer or prompt surfaces
- [x] Read-only boundary verified
- [x] Docs updated if user-facing behavior changes

## Evidence Log

- 2026-06-25T10:35:29Z: Exposed context-pack metadata from the read-only viewer server through /api/index using the shared context reader helper. The response includes ordered context file metadata, missing/warning data, and profile command references with descriptions, without embedding full context content. Existing context browsing remains unchanged. Passed viewer smoke: node --test test/viewer-server.test.js.

- 2026-06-25T10:34:19Z: Exposing context-pack metadata through viewer/server integration backed by the shared context reader helper

- 2026-06-25T10:34:16Z: Dependencies T-002 and T-003 are done; shared helper and CLI shape are available for viewer/agent integration.

- 2026-06-24T21:51:46Z: Waiting for the context reader library and CLI shape from T-002/T-003.
- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
