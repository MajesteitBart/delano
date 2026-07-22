---
id: WS-C
name: WS-C Packaged Runtime and Adoption
owner: bart
status: done
created: 2026-07-14T16:45:49Z
updated: 2026-07-17T09:07:29Z
operating_mode: feature
---

# Workstream: WS-C Packaged Runtime and Adoption

## Objective

Ship one package-owned Viewer runtime, remove redundant consuming-repository Viewer payload, align every canonical and generated guidance surface, and prove upgrade/release safety.

## Owned Files/Areas

- `assets/install-manifest.json`, `assets/payload/`, install categories/presets, package contents, and package/install tests
- `HANDBOOK.md`, root and Viewer READMEs, CLI help, relevant rules/skills/templates, and release notes/guidance
- `.agents` to `.claude` compatibility mirror regeneration and drift checks
- Release validation and delegated browser smoke evidence

## Dependencies

- WS-B completed runtime behavior and migration compatibility
- Existing package-root Viewer launch through `getPackageRoot()`
- Package build, manifest drift, npm pack, mirror, and release validation commands

## Risks

- Removing package files instead of only target-install copies breaks `delano viewer`.
- Existing repositories may contain modified local Viewer files that must never be deleted automatically.
- Canonical docs, installed payload, and generated compatibility mirrors can drift during the transition.

## Handoff Criteria

- Npm package contains and executes the Viewer while fresh consuming installs contain no `.delano/viewer` files.
- Upgrade guidance identifies inert legacy copies and provides only explicit modification-aware cleanup.
- Handbook, README, skills, rules, templates, CLI help, mirrors, and generated assets describe the same capability/review/storage model.
- Package, payload, mirror, schema, full validation, and browser release gates pass with recorded evidence.
