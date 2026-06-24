---
id: T-001
name: Define context reader contract and canonical ordering
status: ready
workstream: WS-A
created: 2026-06-24T21:51:46Z
updated: 2026-06-24T21:51:46Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
story_id: US-000
acceptance_criteria_ids: [AC-000, AC-001, AC-002]
---

# Task: Define context reader contract and canonical ordering

## Description

Turn the vague idea of "read `.project/context` cleanly" into an implementation-ready contract: canonical file order, profiles, selector behavior, output fields, max-size policy, and failure semantics.

## Acceptance Criteria

- [ ] The canonical order is documented, including how `.project/context/README.md` is parsed and what fallback order is used.
- [ ] v1 profiles are named and mapped to concrete files: `overview`, `implementation`, `ui`, and `all`.
- [ ] JSON output fields are defined for list/read operations.
- [ ] Markdown output format is defined with deterministic file boundaries.
- [ ] Missing-file behavior is defined for normal and strict reads.
- [ ] Max-character defaults and warning/truncation policy are defined.
- [ ] The contract explicitly forbids absolute selectors, traversal, symlink escape, and write behavior.

## Traceability

- Story: US-000
- Acceptance criteria: AC-000, AC-001, AC-002

## Technical Notes

- Inspect current `.project/context/README.md` and the existing context files before finalizing order/profile definitions.
- Keep this task documentation-only unless a tiny probe script is needed to measure output size.
- Do not implement CLI routing here unless the reader contract is already stable.

## Definition of Done

- [ ] Implementation-ready contract written in spec/plan or a referenced design note.
- [ ] Open questions either resolved or explicitly deferred.
- [ ] T-002 has enough detail to implement without inventing semantics.
- [ ] `delano validate` passes after contract updates.

## Evidence Log

- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
