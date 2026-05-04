---
id: T-004
name: Rebuild payload and manifest sync
status: done
workstream: WS-B
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: [T-003]
parallel: false
priority: high
estimate: M
---

# Task: Rebuild payload and manifest sync

## Description

Rebuild generated runtime payload assets and align `assets/install-manifest.json` with the generated payload so package drift checks pass.

## Acceptance Criteria

- [x] `npm run build:assets` completes without introducing unexplained generated drift.
- [x] `npm run check:package-manifest` passes.
- [x] Added or removed payload files are reflected in the install manifest intentionally.
- [x] Evidence records the build and package-manifest check results.

## Technical Notes

- Move this task to `ready` after T-003 decides how tracked package output is governed.
- Expect broad generated diffs in `assets/payload/`; review them against manifest intent.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from reproduced package-manifest drift failure; implementation evidence pending.
- 2026-05-04T09:35:25Z: Rebuilt `assets/payload/` from the 177-entry install manifest after runtime changes. Validation passed: `npm run build:assets`; `npm run check:package-manifest`.
