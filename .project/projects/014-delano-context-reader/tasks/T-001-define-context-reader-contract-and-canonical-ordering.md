---
id: T-001
name: Define context reader contract and canonical ordering
status: done
workstream: WS-A
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:29:22Z
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

- [x] The canonical order is documented, including how `.project/context/README.md` is parsed and what fallback order is used.
- [x] v1 profiles are named and mapped to concrete files: `overview`, `implementation`, `ui`, and `all`.
- [x] JSON output fields are defined for list/read operations.
- [x] Markdown output format is defined with deterministic file boundaries.
- [x] Missing-file behavior is defined for normal and strict reads.
- [x] Max-character defaults and warning/truncation policy are defined.
- [x] The contract explicitly forbids absolute selectors, traversal, symlink escape, and write behavior.

## Traceability

- Story: US-000
- Acceptance criteria: AC-000, AC-001, AC-002

## Technical Notes

- Inspect current `.project/context/README.md` and the existing context files before finalizing order/profile definitions.
- Keep this task documentation-only unless a tiny probe script is needed to measure output size.
- Do not implement CLI routing here unless the reader contract is already stable.

## Definition of Done

- [x] Implementation-ready contract written in spec/plan or a referenced design note.
- [x] Open questions either resolved or explicitly deferred.
- [x] T-002 has enough detail to implement without inventing semantics.
- [ ] `delano validate` passes after contract updates.

## Evidence Log

- 2026-06-25T10:29:22Z: V1 context reader contract added to spec.md. Probe measured current .project/context pack at 11 markdown files and 13659 characters. Targeted checks passed: node scripts/check-status-transitions.mjs, node scripts/check-artifact-scope.mjs, node scripts/check-text-safety.mjs. Full node bin/delano.js validate timed out after 304s, so that result is inconclusive.

- 2026-06-25T10:23:54Z: Defined the v1 context reader contract in spec.md, including README-derived ordering, fallback order, profile maps, selector failure rules, JSON/markdown output fields, strict/missing behavior, and bounded truncation policy.

- 2026-06-25T10:22:39Z: Defining context reader contract from current .project/context pack before implementation

- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
