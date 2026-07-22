---
id: T-008
name: Align handbook, skills, guidance, mirrors, and generated assets
status: done
workstream: WS-C
created: 2026-07-14T16:49:30Z
updated: 2026-07-17T08:41:17Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005, T-006, T-007]
conflicts_with: [HANDBOOK.md]
parallel: false
priority: medium
estimate: L
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-008, AC-012, AC-013]
---

# Task: Align handbook, skills, guidance, mirrors, and generated assets

## Description

Update every canonical and generated guidance surface to teach branch-local delivery state, explicit Viewer capabilities, tracked collaborative reviews, checkout-neutral validation, package-owned Viewer runtime, privacy, migration, and rollback.

## Acceptance Criteria

- [x] HANDBOOK.md, root/Viewer READMEs, CLI help, AGENTS-linked guidance, relevant rules/skills/templates, and release notes describe one consistent model.
- [x] Prior inspect-only, .project/viewer canonical-storage, linked-only validation, and repository-installed Viewer claims are removed or explicitly superseded.
- [x] The .agents source is updated first, the .claude mirror is regenerated, and mirror/entry-doc checks pass.
- [x] Generated npm payload and package manifest contain only the intended installable runtime and project artifacts.
- [x] Upgrade guidance covers privacy, explicit publication, non-destructive review migration, and modification-aware legacy Viewer cleanup.

## Traceability
- Story: US-004
- Acceptance criteria: AC-008, AC-012, AC-013

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-17T08:41:17Z: Self-review: inspected WS-C doc/runtime diff and stale-claim scan. Claude mirror parity passed for 294 files; package manifest drift passed for 209 entries; entry docs, 8 artifact schemas, 4 review-contract tests, text safety, generated payload boundary, viewer help, and diff checks passed.

- 2026-07-17T08:34:28Z: Begin canonical guidance, mirror, and generated asset alignment.

- 2026-07-17T08:34:28Z: Readiness review passed: T-005, T-006, and T-007 are done; migration, validation, and package boundary are available.
- 2026-07-14T16:49:30Z: Created from .project/templates/task.md by `delano task add`.
