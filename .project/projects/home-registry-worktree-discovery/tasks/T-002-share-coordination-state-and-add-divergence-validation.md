---
id: T-002
name: Share coordination state and add divergence validation
status: done
workstream: WS-A
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T11:50:58Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: [.agents/scripts/**, src/cli/lib/**]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-003, AC-004, AC-006]
---

# Task: Share coordination state and add divergence validation

## Description

Inventory every supported lease, lock, conflict, and handoff-coordination caller, resolve them through one `<git-common-dir>/delano/` path resolver with idempotent migration of recognized legacy files, then compute the committed-divergence and dirty-state model relative to the primary worktree and enforce it in `delano validate`.

## Acceptance Criteria
- [x] Every supported coordination caller in two linked worktrees resolves the same `<git-common-dir>/delano/` location; tests prove cross-worktree visibility and absence of coordination output in Git-tracked `.project/` state.
- [x] First-run migration moves or merges only recognized legacy coordination files, preserves content, is idempotent, and prints one concise notice; unknown `.project/` content is never moved or deleted, and collision/failure paths preserve both sources with an actionable error.
- [x] Non-primary worktrees are classified as unavailable, clean, diverged, or dirty using committed `.project/` differences plus local tracked/untracked changes; detached HEAD, missing `.project/`, prunable worktrees, and Git failures produce explicit results rather than clean fallbacks.
- [x] `delano validate` fails on uncommitted linked-worktree `.project/` changes unless `--allow-worktree-state` is present, warns for recognized legacy coordination files, and fixtures cover all status/override outcomes.

## Traceability
- Story: US-004
- Acceptance criteria: AC-003 AC-004 AC-006

## Technical Notes

- Complete the caller/file-shape inventory before implementing migration; do not assume `.git/` is a directory in linked worktrees.
- Keep committed divergence distinct from dirty state even when both are present; the viewer may summarize dirty as highest severity while retaining details.
- Use path-scoped Git commands for `.project/`; avoid parsing human-oriented Git output.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T11:50:58Z: Shared Git-common-dir coordination with safe migration and collision preservation; added clean/diverged/dirty/unavailable classification and linked-worktree validation override. node --test test/cli.test.js: 48 passed. Focused package gates: 8 passed. Evidence map, mirror parity, package manifest, and diff checks passed. Locked .claude worktree was recovered clean after mirror-safety defect discovery; regression guards added.

- 2026-07-13T11:41:50Z: Inventorying coordination callers and implementing shared Git-common-dir state plus divergence validation.

- 2026-07-13T11:41:50Z: T-001 dependency is done; coordination and validation scope readiness-reviewed against the active spec.
- 2026-07-13T10:57:56Z: Created during plan condensation; merges the prior T-003 (coordination move) and T-004 (divergence/validation) which shared the `.agents/scripts/**` conflict zone.
