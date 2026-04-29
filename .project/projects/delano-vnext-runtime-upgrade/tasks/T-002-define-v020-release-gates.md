---
id: T-002
name: Define v0.2.0 release gates
status: done
workstream: WS-A
created: 2026-04-29T21:57:00Z
updated: 2026-04-30T02:52:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Define v0.2.0 release gates

## Description

Create explicit release gates that determine whether Delano v0.2.0 is ready to ship.

## Acceptance Criteria
- [x] Gates cover tests, package metadata, manifest/payload drift, privacy logging defaults, schema validation, and docs.
- [x] Gates distinguish must-have v0.2 checks from later maturity checks.
- [x] Gates are represented in a place agents and maintainers will read before release.

## Technical Notes

Likely target: release checklist in this project, package docs, or a dedicated `.project` closeout/release-readiness artifact.

## Definition of Done
- [x] Release gate artifact created or updated.
- [x] Local verification command list included.
- [x] Deferred gates documented.

## Evidence Log
- 2026-04-30T02:52:00Z: Added `.project/projects/delano-vnext-runtime-upgrade/release-gates.md` with must-have v0.2 gates for PM validation, package tests, asset/package drift, privacy logging defaults, schemas/contracts, dry-run sync, leases, learning/evals, and compact agent docs; later maturity gates are explicitly deferred. Validation passed: `npm run build:assets`; `bash .agents/scripts/pm/validate.sh`; `npm test`.
