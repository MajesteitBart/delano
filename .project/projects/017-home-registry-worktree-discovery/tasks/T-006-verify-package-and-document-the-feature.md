---
id: T-006
name: Verify, package, and document the feature
status: done
workstream: WS-A
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T13:42:01Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-004, T-005]
conflicts_with: [docs/**, test/**, .delano/viewer/public/**, assets/payload/**]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008]
---

# Task: Verify, package, and document the feature

## Description

Run the cross-boundary quality pass, close remaining regression gaps, document the feature, rebuild generated viewer/package artifacts, and record release-ready evidence without publishing or pushing.

## Acceptance Criteria
- [x] Automated fixtures exercise two repositories, primary/linked/detached/stale worktrees, clean/diverged/dirty `.project/` state, shared coordination, linked-write rejection, and schema-derived task filters.
- [x] One delegated browser smoke verifies repository/worktree switching, persistent provenance, divergence details, all-status Tasks filtering, refresh fallback, responsive layout, and zero console errors. The policy-preferred `codex exec` attempts timed out; the operator-requested `playwright-interactive` retry completed the same gate and is recorded in the evidence log.
- [x] Docs explain registry location/privacy, registration/forgetting, worktree discovery, selected project-data semantics, linked read-only behavior, coordination migration, validation override, and canonical filter sources.
- [x] Viewer build/type-check, `npm test`, payload build, package drift check, `delano validate`, and release validation pass; any intentionally skipped check is recorded with reason; generated assets match source and evidence logs identify commands/results without remote writes.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001 AC-002 AC-003 AC-004 AC-005 AC-006 AC-007 AC-008

## Technical Notes

- Follow `.agents/rules/browser-delegation.md`; do not spawn a browser-automation subagent.
- Run the viewer UI build before `npm run build:assets`; the payload builder does not compile the viewer source.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T13:42:01Z: Viewer build passed; npm test 117/117; payload manifest 216 entries; delano validate and release validation reported 0 errors/0 warnings; Playwright-interactive smoke captured desktop, linked, Tasks-filtered, and 390px mobile views with zero console/page errors.

- 2026-07-13T12:14:53Z: Running cross-boundary verification, packaging, documentation, and browser smoke evidence.
- 2026-07-13T10:57:56Z: Created during plan condensation; carries forward the prior T-010 with the browser verification consolidated into one delegated run.
