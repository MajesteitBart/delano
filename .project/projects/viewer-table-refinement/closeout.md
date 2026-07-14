---
name: Viewer Table Refinement Closeout
status: done
created: 2026-07-13T21:12:21Z
updated: 2026-07-13T21:12:21Z
owner: bart
---

# Closeout: Viewer Table Refinement

## Outcome Review

### Target Outcome

Make viewer ledger tables spacious, directly navigable, consistently sorted, and filterable by relationship, canonical option, and date range while linked-worktree research remains verifiably visible.

### Actual Outcome

Completed. Ledger tables have one boundary and shared padding; project links open Project overview; time-relevant tables open newest-first while Context pack preserves canonical order; Projects shows Created; relationship, bounded-option, and date-range filters are searchable and selectable; the annotation badge counts only open comments while the table preserves non-deleted history; and the linked parity worktree renders all six research documents.

### Delta

No acceptance delta. The annotation clarification was made explicit in source tests and documentation: resolved and closed comments stay in the table even though they do not contribute to the sidebar badge.

### Root Causes

- DataTable call sites added a second Card boundary around an already bordered table and used compressed shared cell padding.
- Explicit project links reused selector semantics, so they changed selection without changing the active Workspace route.
- Time, relationship, and canonical-option columns had no shared initial-sort or typed-filter model.
- The shared preview process was serving an older server index, which reported no nested research even though the current source indexed it.

### Follow-up Actions

- Review the proposed lifecycle learning below separately; do not adopt it as part of this viewer scope.

## Closure Checklist

- [x] Required tasks resolved
- [x] Quality gates passed
- [x] Evidence package complete
- [x] Registry/state updated through Delano lifecycle commands
- [x] Learning proposal drafted where a workflow defect was observed
- [x] Learning proposal reviewed and kept proposed rather than adopted in this scope
- [x] Retrospective not required for this scoped viewer refinement

## Learning Proposal

### Proposal Type

fixture

### Title

Promote a ready workstream when `delano workstream start` is invoked.

### Rationale

`delano workstream add` produced a `ready` workstream, but `delano workstream start` only promoted planned, done, or deferred states. The command appended its reason while leaving the invalid progressed-workstream relationship in place, and the full suite correctly rejected tasks that were done or in progress under a ready workstream.

### Target Paths

- `src/cli/lib/project-state.js`
- `test/state-command-runtime.test.js`

### Evidence

- Initial full-suite run failed two lifecycle assertions for `viewer-table-refinement`.
- The workstream was narrowly corrected to active, recorded with `delano workstream update`, and the suite then passed 117/117.

### Review Gate

Required before adoption. Do not change the CLI promotion contract in this viewer refinement.

### Adoption Status

proposed

## Validation Evidence

- Focused domain, source, TypeScript, targeted ESLint, formatting, and viewer build gates passed.
- `npm test` passed 117/117. Log: `.agents/logs/tests/20260713T210936Z.log`.
- T3 browser smoke passed the navigation, table, filter, ordering, responsive, annotation-count, and linked-research checks. Detailed evidence: `.agents/logs/tests/t005-viewer-table-refinement-browser-smoke.md`.
- Package payload rebuilt with 216 files; manifest drift check passed.
- Delano release validation passed with 0 errors and 0 warnings.
- Full repository lint remains outside the release gate because seven existing react-refresh/use-effect findings are present in untouched shared UI files; targeted lint for all changed source passed.
