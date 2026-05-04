---
id: T-013
name: Verify runtime payload dependencies
status: done
workstream: WS-B
created: 2026-05-04T10:02:29Z
updated: 2026-05-04T10:04:33Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: S
---

# Task: Verify runtime payload dependencies

## Description

Verify that shipped runtime scripts have their required schema and helper dependencies included in the installed payload.

## Acceptance Criteria
- [x] `delivery-event.schema.json` is included in `assets/install-manifest.json`.
- [x] `audit-context-files.mjs` is included in `assets/install-manifest.json`.
- [x] Rebuilt payload contains both runtime dependencies.
- [x] Regression coverage checks these entries remain in the manifest.

## Technical Notes
- Review feedback specifically called out the singular delivery metric schema and `audit-context-files.mjs` as payload-dependency risks.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T10:02:29Z: Added manifest entries and regression coverage for shipped runtime dependencies.
- 2026-05-04T10:04:33Z: `npm run build:assets` passed and staged 183 payload files; `npm run check:package-manifest` passed for 183 manifest entries; explicit payload check confirmed `.agents/schemas/metrics/delivery-event.schema.json` and `.agents/scripts/audit-context-files.mjs` exist under `assets/payload/`; `npm test` passed with 50 tests.
