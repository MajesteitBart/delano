---
id: T-011
name: Align handbook skills templates and package surfaces
status: planned
workstream: WS-D
created: 2026-08-08T20:17:17Z
updated: 2026-08-08T20:17:29Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-005, T-008]
conflicts_with: [HANDBOOK.md, AGENTS.md, docs/**, openwiki/**, .claude/**, assets/**]
parallel: false
priority: medium
estimate: L
operating_mode: multi-stream
story_id: US-001,US-002,US-003,US-004,US-005,US-006
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-005, AC-007, AC-010]
---

# Task: Align handbook skills templates and package surfaces

## Description

Make Delano's canonical guidance, lifecycle skills, templates, generated compatibility runtime, Viewer build, and package boundary describe and ship the same user-value, stop-loss, and product-closeout behavior.

## Acceptance Criteria

- [ ] `HANDBOOK.md` and `AGENTS.md` make user/job/demo value, honest infrastructure, vertical proof, immediate stop authority, re-boil, and human product closeout first-class in the lifecycle and role playbooks.
- [ ] Discovery, planning, breakdown, execution, quality, closeout, and learning assets share the approved contract and tell agents to stop rather than route around value drift.
- [ ] Spec/plan/workstream/task/completion templates remain concise, mode-scaled, and explicit about required product behavior versus optional ceremony reduction.
- [ ] User/CLI/Viewer guidance and relevant OpenWiki source pages document activation, migration, status signals, conflict/failure behavior, representative data, human review, infrastructure, and trust limitations.
- [ ] Documentation explicitly rejects screenshots-only acceptance, word/file/task-count policing, universal UX scores, foundation bans, and automated evidence as a substitute for the intended job.
- [ ] Canonical `.agents/` changes are synchronized through the normal mirror command; Viewer source is built before compiled/payload generation when changed.
- [ ] Install manifest and package tests explicitly assert every new rule, skill, template, schema, fixture runner, CLI/Viewer dependency, and compiled asset required by consumers.

## Traceability
- Story: US-001,US-002,US-003,US-004,US-005,US-006
- Acceptance criteria: AC-001, AC-002, AC-003, AC-005, AC-007, AC-010

## Technical Notes

Keep top-level agent entrypoints thin. Do not hand-edit `.claude/`, Viewer public assets, or payload files. Generated OpenWiki pages are not manually authored.

## Definition of Done
- [ ] Canonical guidance and skill/template updates complete
- [ ] Mirror, Viewer build if applicable, payload, and manifest checks pass
- [ ] Review confirms no old conformance-only closeout path remains documented
- [ ] Package/adoption handoff ready for T-012

## Evidence Log
- 2026-08-08T20:17:17Z: Created from `.project/templates/task.md` by `delano task add`; implementation evidence pending.
