---
id: T-002
name: Asset manifest and build pipeline
status: backlog
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:00:36Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Asset manifest and build pipeline

## Description

Define the allowlist-driven asset manifest for the approved install payload and add the build step that stages those runtime assets into the npm package.

## Acceptance Criteria
- [ ] The approved base install payload is encoded in a machine-readable manifest or equivalent source of truth.
- [ ] Packaged assets exclude non-approved top-level adapter entry docs from the default install set.
- [ ] The asset build step produces a predictable package layout for runtime and scaffold files.
- [ ] The asset definition is reviewable enough to reason about future upgrades and install diffs.

## Technical Notes

- Likely touch points include `scripts/build-npm-assets.mjs`, `assets/`, and package metadata that controls publish contents.
- Keep the asset source of truth narrow and explicit; avoid recursive package globs that hide what will ship.
- Do not treat `.claude` as canonical packaged runtime content in the base install path.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
