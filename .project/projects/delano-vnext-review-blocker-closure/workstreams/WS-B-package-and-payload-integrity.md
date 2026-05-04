---
name: WS-B Package and Payload Integrity
owner: bart
status: done
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
---

# Workstream: WS-B Package and Payload Integrity

## Objective

Make package metadata, tracked pack output, install manifest, and generated payload agree before v0.2 is considered releasable.

## Owned Files/Areas

- `package.json`
- `pack-output.json`
- `assets/install-manifest.json`
- `assets/payload/`
- `scripts/check-package-manifest-drift.mjs`
- Package-related tests

## Dependencies

- Current package build pipeline.
- Decision on whether `pack-output.json` remains tracked.

## Risks

- Rebuilding generated assets may produce broad diffs.
- Removing tracked package output may require updating tests or release docs.

## Handoff Criteria

- Package drift checks pass.
- Tracked package metadata cannot silently disagree with `package.json`.
- Generated payload reflects the current install manifest.
