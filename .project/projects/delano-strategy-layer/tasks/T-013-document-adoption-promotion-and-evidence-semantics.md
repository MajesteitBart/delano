---
id: T-013
name: Document adoption promotion and evidence semantics
status: planned
workstream: WS-D
created: 2026-07-24T00:59:25Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-006, T-010]
conflicts_with: [HANDBOOK.md, AGENTS.md, docs/**, openwiki/**, .agents/skills/discovery-skill/**]
parallel: true
priority: medium
estimate: M
operating_mode: multi-stream
story_id: US-001,US-002,US-003,US-005
acceptance_criteria_ids: [AC-002, AC-004, AC-006, AC-012]
---

# Task: Document adoption promotion and evidence semantics

## Description

Align the canonical operating model, user/CLI/viewer guidance, and discovery workflow with optional adoption, single-source traceability, evidence receipts, manual closure, and the promotion-then-handover sequence.

## Acceptance Criteria

- [ ] `HANDBOOK.md` adds the strategy hierarchy and states that `.project` remains the only persisted source of truth.
- [ ] CLI/user guidance documents exact init/add/show/move/lifecycle/promote commands, opt-in behavior, closure gate, and one-to-many derived links.
- [ ] Viewer guidance explains receipt fields, advisory staleness, guarded moves/promotion, conflicts, archive, and separate optional handover.
- [ ] Discovery-skill guidance requires resolving and reading a promoted project’s `roadmap_item` before finalizing its outcome hypothesis.
- [ ] Documentation explicitly excludes dates, timeline, Gantt, dependencies, estimates, assignees, velocity, commit counts, automatic closure, and public sharing.
- [ ] Examples never store a roadmap project list or imply that vision/mission prose has structural/minimum-length validation.
- [ ] OpenWiki source-facing pages are updated only where current source behavior changed; generated wiki pages are not hand-edited.

## Traceability
- Story: US-001,US-002,US-003,US-005
- Acceptance criteria: AC-002, AC-004, AC-006, AC-012

## Technical Notes

Keep `AGENTS.md` changes minimal and operational. Author shared skill changes under `.agents/`; T-012 performs mirror synchronization.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Documentation checks pass

## Evidence Log
- 2026-07-24T00:59:25Z: Created from .project/templates/task.md by `delano task add`.
