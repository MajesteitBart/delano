---
id: T-007
name: Stop installing repository-local Viewer runtime
status: done
workstream: WS-C
created: 2026-07-14T16:49:29Z
updated: 2026-07-17T08:41:16Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-005, T-006]
conflicts_with: [assets/install-manifest.json]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-012]
---

# Task: Stop installing repository-local Viewer runtime

## Description

Keep the executable Viewer in the active npm package while removing duplicate .delano/viewer files from consuming-repository install manifests, categories, presets, payloads, and expectations.

## Acceptance Criteria

- [x] npm pack contains the Viewer server and compiled public assets used by delano viewer.
- [x] Fresh full and update-safe consuming-repository installs contain no .delano/viewer files.
- [x] Package-root Viewer launch succeeds whether the active CLI package is global, local, or invoked through an equivalent package mechanism.
- [x] Legacy repository-local Viewer copies are never executed and no cleanup path deletes modified or unrecognized files automatically.
- [x] Install, package-content, payload-build, and manifest-drift tests enforce the new boundary.

## Traceability
- Story: US-004
- Acceptance criteria: AC-012

## Technical Notes

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-17T08:41:16Z: Packed-tarball install test passed: installed CLI resolves package-owned Viewer and ignores a conflicting repository-local server.

- 2026-07-17T08:34:14Z: npm run build:assets passed (205 files); focused package boundary tests passed 4/4; npm run check:package-manifest passed; install help and payload scan confirm no repository-local Viewer installation; modified legacy copy preservation test passed.

- 2026-07-17T08:31:29Z: Begin package-owned Viewer boundary implementation.

- 2026-07-17T08:31:29Z: Readiness review passed: T-005 and T-006 are done; package-root Viewer launch is available; WS-C package surfaces are dependency-safe.
- 2026-07-14T16:49:29Z: Created from .project/templates/task.md by `delano task add`.
