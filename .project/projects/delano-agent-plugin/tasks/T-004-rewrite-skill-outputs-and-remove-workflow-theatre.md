---
id: T-004
name: Rewrite skill outputs and remove workflow theatre
status: done
workstream: WS-A
created: 2026-09-13T12:57:01Z
updated: 2026-09-13T13:04:38Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: false
priority: medium
estimate: M
operating_mode: feature
story_id:
acceptance_criteria_ids: [AC-003]
---

# Task: Rewrite skill outputs and remove workflow theatre

## Description

Rewrite all ten portable lifecycle skills with unslop. Make each result readable and specific, preserve evidence and authorization boundaries, and remove instructions that encourage unnecessary artifacts, questions, or stage handoffs. Rebuild and check the portable archive.

## Acceptance Criteria

- [x] All ten skills tell the agent what useful result to produce and how to avoid unnecessary process in that workflow.
- [x] Shared writing guidance and all skill resources resolve inside the portable package, including the rebuilt archive.
- [x] Creator validation and existing plugin tests pass; a manual scenario review records concrete coverage and its limits.

## Traceability
- Story: none
- Acceptance criteria: AC-003

## Technical Notes

Manual instruction review by Codex covered ten requests: a settled small fix in discovery; a short factual research question; a probe missing its real service; a plan with an already chosen approach; one feature with implementation and tests to break down; a named fix without a task ID in execution; a review-only quality check with missing evidence; sync with empty mappings or a supplied snapshot; handoff of unfinished work; and learning from a single incident with no supported process change. The review led to three corrections: keep the original probe question unresolved when only components can be tested, select next work only when the user asks for it, and keep unfinished handoff work open. This was a manual reading of the instructions, not an independent agent run or a host installation test.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-09-13T13:04:38Z: Rewrote all ten lifecycle skills and added shared writing and scope guidance in plugins/delano/references/output.md. Each skill now specifies its useful result and avoids unnecessary records, stage handoffs, and approval pauses while retaining acceptance, evidence, scope, and authorization requirements. All ten creator skill validations passed on the final extracted archive. npm run build:plugin and check:plugin passed; final npm run test:plugin passed 5 tests with zero skips. npm run pack:plugin rebuilt the local archive: 25 files, 16677 bytes, SHA-256 adcce8682c8d101477eb4569c664a4c8c6c43ccd3aaa65490fb4572b37b282e2. Every extracted file matches the source byte-for-byte, and the extracted package passes resource validation. Whitespace, quote, and code-fence checks passed for the ten skills and shared guide. Self-review coverage is recorded in Technical Notes. No independent agent evaluation, host install, GUI check, or full CLI regression was run; this change affects skill instructions and packaged documentation, and legacy validation remains unavailable while the runtime trees are deleted. Changes and evidence remain uncommitted.

- 2026-09-13T12:57:01Z: User requested readable skill outputs without fluff or workflow theatre. Use the existing state services because the legacy runtime is deleted.
- 2026-09-13T12:57:01Z: Created from .project/templates/task.md by `delano task add`.
