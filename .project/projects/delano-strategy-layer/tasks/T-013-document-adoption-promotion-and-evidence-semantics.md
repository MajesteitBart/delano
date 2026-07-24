---
id: T-013
name: Document adoption promotion and evidence semantics
status: done
workstream: WS-D
created: 2026-07-24T00:59:25Z
updated: 2026-07-24T13:54:15Z
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

- [x] `HANDBOOK.md` adds the strategy hierarchy and states that `.project` remains the only persisted source of truth.
- [x] CLI/user guidance documents exact init/add/show/move/lifecycle/promote commands, opt-in behavior, closure gate, and one-to-many derived links.
- [x] Viewer guidance explains receipt fields, advisory staleness, guarded moves/promotion, conflicts, archive, and separate optional handover.
- [x] Discovery-skill guidance requires resolving and reading a promoted project’s `roadmap_item` before finalizing its outcome hypothesis.
- [x] Documentation explicitly excludes dates, timeline, Gantt, dependencies, estimates, assignees, velocity, commit counts, automatic closure, and public sharing.
- [x] Examples never store a roadmap project list or imply that vision/mission prose has structural/minimum-length validation.
- [x] OpenWiki source-facing pages are updated only where current source behavior changed; generated wiki pages are not hand-edited.

## Traceability
- Story: US-001,US-002,US-003,US-005
- Acceptance criteria: AC-002, AC-004, AC-006, AC-012

## Technical Notes

Keep `AGENTS.md` changes minimal and operational. Author shared skill changes under `.agents/`; T-012 performs mirror synchronization.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Documentation checks pass

## Evidence Log

- 2026-07-24T13:54:15Z: HANDBOOK, README, CLI/user/Viewer guides, discovery runbook, Viewer runtime README, and relevant OpenWiki pages document optional adoption, derived links/receipts, manual closure, guarded actions/conflicts, separate handover, live highlights, and explicit non-goals. Mirror, payload, manifest, entry-doc, text-safety, CLI help, and scoped diff checks passed.

- 2026-07-24T13:49:01Z: Begin canonical strategy-layer adoption, promotion, viewer, evidence, and discovery guidance updates.

- 2026-07-24T13:42:29Z: Adoption, promotion, board, and handover semantics are stable and dependency-safe for documentation.

- 2026-07-24T12:41:12Z: Doc impact from T-011: board cards receive bounded two-pulse highlight plus a textual Updated chip when their item or any linked project document changes on disk; unrelated events do not flash cards; document the live-update behavior in viewer guidance.

- 2026-07-24T12:35:46Z: Doc impact from T-010: board cards gained keyboard-operable move and promotion flows (destination preview, reason field, explicit confirm, 409 conflict surfacing without optimistic state) and a separate optional post-promotion start handover panel against the returned spec; document the action flow and its capability/hash guards.

- 2026-07-24T12:25:02Z: Doc impact from T-008: viewer gained a Roadmap workspace view (index-capability gated nav entry, now/next/later board, archive control, attention states, adoption empty state citing delano roadmap init/add); document board semantics, staleness advisory wording, and source-navigation behavior.
- 2026-07-24T00:59:25Z: Created from .project/templates/task.md by `delano task add`.
