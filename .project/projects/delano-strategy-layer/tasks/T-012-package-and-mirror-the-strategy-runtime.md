---
id: T-012
name: Package and mirror the strategy runtime
status: done
workstream: WS-D
created: 2026-07-24T00:59:24Z
updated: 2026-07-24T13:48:43Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002, T-003, T-006, T-010, T-011]
conflicts_with: [.claude/**, .delano/viewer/public/**, assets/install-manifest.json, assets/payload/**, test/package.test.js]
parallel: false
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-001,US-004,US-006
acceptance_criteria_ids: [AC-001, AC-002, AC-007]
---

# Task: Package and mirror the strategy runtime

## Description

Build and synchronize every generated/shipped representation of the strategy runtime, with explicit package assertions that prevent silent omission of new feature assets.

## Acceptance Criteria

- [x] Canonical `.agents/` changes are synchronized through `npm run sync:claude-mirror`; mirror parity passes without direct `.claude/` edits.
- [x] Viewer source is typechecked/tested and built before any public asset or install-payload rebuild.
- [x] Every new strategy template, schema, rule, script, CLI/viewer runtime dependency, and compiled viewer asset required by consumers is represented by the install/package boundary.
- [x] Package tests explicitly assert the installed presence and usable content of vision, mission, roadmap, validator, and viewer artifacts.
- [x] `npm run build:assets`, `npm run check:package-manifest`, mirror parity, viewer build checks, and package dry-run pass from a cleanly regenerated state.
- [x] Generated diffs are reviewed for stale hashed assets, missing sources, and accidental repository-owned strategy data.

## Traceability
- Story: US-001,US-004,US-006
- Acceptance criteria: AC-001, AC-002, AC-007

## Technical Notes

Do not hand-edit `.claude/`, `.delano/viewer/public/`, or `assets/payload/`. A broad new directory-versus-manifest policy is not required by this feature; explicit assertions close the relevant omission risk without changing unrelated packaging scope.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Package/install notes updated where behavior changes

## Evidence Log

- 2026-07-24T13:48:43Z: Viewer source checks/build passed; mirror parity 310/310; payload/manifest parity 226 entries; package suite 62/62; npm pack dry-run passed with 289 files; generated strategy payload reviewed.

- 2026-07-24T13:42:30Z: Begin generated viewer, mirror, payload, and package-boundary integration.

- 2026-07-24T13:42:29Z: All declared contract, CLI, promotion, viewer action, and live-update dependencies are done; WS-D handoff authorizes generated integration work.
- 2026-07-24T00:59:24Z: Created from .project/templates/task.md by `delano task add`.
