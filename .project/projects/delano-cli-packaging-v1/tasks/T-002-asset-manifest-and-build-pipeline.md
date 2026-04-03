---
id: T-002
name: Asset manifest and build pipeline
status: review
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T18:10:00Z
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
- [x] The approved base install payload is encoded in a machine-readable manifest or equivalent source of truth.
- [x] Packaged assets exclude non-approved top-level adapter entry docs from the default install set.
- [x] The asset build step produces a predictable package layout for runtime and scaffold files.
- [x] The asset definition is reviewable enough to reason about future upgrades and install diffs.

## Technical Notes

- Likely touch points include `scripts/build-npm-assets.mjs`, `assets/`, and package metadata that controls publish contents.
- Keep the asset source of truth narrow and explicit; avoid recursive package globs that hide what will ship.
- Do not treat `.claude` as canonical packaged runtime content in the base install path.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [ ] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Added `assets/install-manifest.json` and `scripts/build-npm-assets.mjs`, then verified `npm run build:assets` and `npm pack --dry-run` produced the expected packaged payload without top-level adapter entry docs.
- 2026-04-03: Reworked the install manifest to map generic context template sources into `.project/context/*` install targets, updated the build/install logic to use target-aware staged assets, and added regression coverage so the npm payload no longer carries Delano repo-specific context content.
