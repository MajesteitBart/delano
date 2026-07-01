---
id: T-005
name: Design reviewed file-application workflow
status: done
workstream: WS-A
created: 2026-06-30T14:12:17Z
updated: 2026-06-30T14:56:09Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001, T-004]
conflicts_with: []
parallel: false
priority: high
estimate: L
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Design reviewed file-application workflow

## Description

Turn the viewer from read-only into a guarded writer by adding explicit review/apply controls for edits generated from annotations or chat responses.

## Acceptance Criteria

- [x] No AI response writes directly to .project markdown without a preview diff and explicit user apply action.
- [x] Apply endpoints re-read current file hashes and reject stale baselines, unsafe paths, and non-.project targets.
- [x] Rollback guidance and audit evidence are stored with the annotation or update record.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- This is the boundary that turns "not read-only" into "guarded writer"; implementation should not be bundled into the first chat endpoint unless preview/apply semantics are ready.
- Apply requests should carry the annotation/chat id, target source path, expected file hash, generated patch or full proposed replacement, and user confirmation timestamp.
- Rejection messages should be explicit enough for agents to retry from fresh context.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T14:56:09Z: Implemented guarded /api/apply/preview and /api/apply endpoints that reject stale baselines, unsafe paths, and non-.project markdown targets; tests verify diffs and stale-baseline rejection; chat responses never write files directly.

- 2026-06-30T14:56:01Z: Chat integration is complete; guarded preview/apply workflow is implemented and tested.
- 2026-06-30T14:12:17Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from Delano viewer read-only safety review and requested non-read-only direction.
