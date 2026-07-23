---
name: WS-B Asset Packaging and Conservative Install
owner: team
status: done
created: 2026-04-03T12:00:36Z
updated: 2026-04-28T22:08:32Z
---

# Workstream: WS-B Asset Packaging and Conservative Install

## Objective

Package the approved Delano runtime payload into the npm package and implement a conflict-first install flow that writes only the allowlisted assets and only when safe.

## Owned Files/Areas

- package asset manifest(s)
- `scripts/build-npm-assets.mjs`
- packaged runtime and scaffold assets
- install-planning, conflict-reporting, and write-path logic under the CLI source tree

## Dependencies

- WS-A command framework
- approved install payload and top-level-doc opt-in rule
- current repo inventory for `.agents`, `.project`, and `.delano`

## Risks

- accidentally packaging or writing files outside the approved payload
- silently overwriting user-owned `.project` or `.agents` content
- allowing `.claude` or top-level adapter docs to creep into the default install path

## Handoff Criteria

- packaged assets are driven by an explicit allowlist
- install planning reports sorted conflicts with path type and reason
- `--force` only affects paths inside the approved payload
- normal install path is conservative by default
