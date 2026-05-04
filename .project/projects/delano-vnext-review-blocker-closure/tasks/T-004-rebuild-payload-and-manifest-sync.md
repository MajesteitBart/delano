---
id: T-004
name: Rebuild payload and manifest sync
status: deferred
workstream: WS-B
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:25:06Z
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

- [ ] `npm run build:assets` completes without introducing unexplained generated drift.
- [ ] `npm run check:package-manifest` passes.
- [ ] Added or removed payload files are reflected in the install manifest intentionally.
- [ ] Evidence records the build and package-manifest check results.

## Technical Notes

- Move this task to `ready` after T-003 decides how tracked package output is governed.
- Expect broad generated diffs in `assets/payload/`; review them against manifest intent.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-05-04T09:25:06Z: Task created from reproduced package-manifest drift failure; implementation evidence pending.
