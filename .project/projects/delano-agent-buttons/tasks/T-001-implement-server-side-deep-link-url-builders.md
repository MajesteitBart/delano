---
id: T-001
name: Implement server-side deep link URL builders
status: ready
workstream: WS-A
created: 2026-06-17T12:38:35Z
updated: 2026-06-17T14:02:00Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [.delano/viewer/server.js, .delano/viewer/public/app.jsx]
parallel: true
priority: high
estimate: M
story_id: US-003
acceptance_criteria_ids: [AC-000, AC-001, AC-002, AC-005, AC-006, AC-007]
---

# Task: Implement server-side deep link URL builders

## Description

Add a constrained server-side deeplink model for Delano viewer agent actions and provider-specific builders for Codex and Claude Code. The builder should return `provider`, `url`, `prompt`, and `warnings` without exposing the absolute repo root through the general `/api/index` payload.

## Acceptance Criteria

- [ ] Codex links encode prompt text and open a new local thread with the target repo path.
- [ ] Claude Code links encode prompt text and open with the target repo as cwd.
- [ ] Builder is exposed through a constrained local endpoint or server-side helper, not by adding repo root to `/api/index`.
- [ ] Endpoint/helper returns `provider`, `url`, `prompt`, and `warnings`.
- [ ] Endpoint/helper accepts only known `provider` and `actionType` enum values.
- [ ] Endpoint/helper accepts identifiers and normalized `.project` relative source paths only; path traversal fails closed.
- [ ] Unit tests cover encoding, missing context, Unicode/newlines, and prompt length thresholds.
- [ ] No generated docs, fixtures, or snapshots contain the developer's absolute local path.
- [ ] Normal server logs and client debug output do not emit generated absolute-path provider URLs.
- [ ] The builder keeps lifecycle actions as prompt-prefill instructions, not browser-triggered command execution.
- [ ] No endpoint invokes `delano` or any lifecycle command.

## Traceability
- Story: US-003
- Acceptance criteria: AC-000, AC-001, AC-002, AC-005, AC-006, AC-007

## Technical Notes
- Implement only pure URL/prompt generation plus a narrow local endpoint or server helper.
- Do not touch `.project` files, invoke `delano` commands, add viewer UI, or expose absolute repo root through `/api/index`.
- Resolve the absolute repo path server-side from trusted runtime context.
- Enforce prompt soft warnings above 3,500 characters and hard fallback before Claude Code's 5,000-character `q` limit.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-17T12:38:35Z: Created from .project/templates/task.md by `delano task add`.
