---
id: T-002
name: Decide legacy generator alignment
status: done
workstream: WS-B
created: 2026-05-12T11:25:19Z
updated: 2026-05-12T13:32:48Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001]
conflicts_with: [.agents/scripts/pm, .claude/scripts/pm, assets/payload]
parallel: false
priority: medium
estimate: M
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002, AC-003, AC-004]
---

# Task: Decide legacy generator alignment

## Description

Decide whether existing shell generators should be redirected to native template-backed commands in this release or explicitly deferred.

## Acceptance Criteria
- [x] Decision is recorded in `decisions.md` or an update note.
- [x] Any changed package payload is rebuilt and checked.
- [x] Follow-up work is explicit if legacy generator alignment is deferred.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001, AC-002, AC-003, AC-004

## Technical Notes

- This task depends on the native command behavior being proven first.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-05-12T13:32:48Z: Recorded legacy generator alignment decision, kept shell generators unchanged for this slice, and verified package/manifest/validation gates.

- 2026-05-12T13:32:13Z: Recorded decision to defer legacy shell generator redirection; follow-up is explicit in decisions.md. Current package/payload state checked with npm test, npm run check:package-manifest, and bash .agents/scripts/pm/validate.sh.
- 2026-05-12T11:54:46Z: T-001 is done; legacy generator alignment decision can be selected next.

- 2026-05-12T11:47:01Z: Waiting for T-001 implementation evidence before legacy generator alignment starts.
- 2026-05-12T11:25:19Z: Task created from state command runtime plan.
