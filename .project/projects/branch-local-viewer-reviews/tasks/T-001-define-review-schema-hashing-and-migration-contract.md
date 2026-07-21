---
id: T-001
name: Define review schema, hashing, and migration contract
status: done
workstream: WS-A
created: 2026-07-14T16:49:26Z
updated: 2026-07-16T17:44:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-002
acceptance_criteria_ids: [AC-004, AC-005, AC-006, AC-007, AC-008, AC-009]
---

# Task: Define review schema, hashing, and migration contract

## Description

Define the selected-context capability contract and the canonical tracked review artifact, including normalized hashing, provenance, lifecycle, anchor/thread representation, privacy rules, and legacy apply-audit mapping.

## Acceptance Criteria

- [x] review.schema.json and the review Markdown template define required provenance, lifecycle enums, findings, resolution state, and human-readable round-trip behavior.
- [x] Tracked review fixtures contain only repository-relative paths and reject absolute or worktree-local paths.
- [x] One normalized content-hash algorithm and cross-platform line-ending fixtures define exact versus stale review semantics independently of HEAD movement.
- [x] The capability fields and fresh-context invariants are documented without primary/linked authorization coupling.
- [x] The legacy annotation, handover, anchor, resolution, and apply-audit migration map is explicit and identifies any visible exception path.

## Traceability
- Story: US-002
- Acceptance criteria: AC-004, AC-005, AC-006, AC-007, AC-008, AC-009

## Technical Notes

- Canonical interface: `contracts/review-and-context-contract.md`.
- Canonical schema/template: `.agents/schemas/artifacts/review.schema.json` and `.project/templates/review.md`.
- Compatibility mirror regenerated with `npm run sync:claude-mirror`; package/install registration remains in WS-C's owned adoption surface.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-16T17:44:00Z: Review contract fixtures passed; npm test 122/122; .agents/scripts/pm/validate.sh 0 errors/0 warnings; Claude mirror parity 290 files.

- 2026-07-16T17:27:06Z: Executing review schema, hashing, capability, and migration contracts.

- 2026-07-16T17:27:06Z: Readiness review passed; dependency-safe frontier for WS-A.
- 2026-07-14T16:49:26Z: Created from .project/templates/task.md by `delano task add`.
