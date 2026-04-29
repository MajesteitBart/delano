---
id: T-002
name: Define v0.2.0 release gates
status: ready
workstream: WS-A
created: 2026-04-29T21:57:00Z
updated: 2026-04-29T21:57:00Z
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
- [ ] Gates cover tests, package metadata, manifest/payload drift, privacy logging defaults, schema validation, and docs.
- [ ] Gates distinguish must-have v0.2 checks from later maturity checks.
- [ ] Gates are represented in a place agents and maintainers will read before release.

## Technical Notes

Likely target: release checklist in this project, package docs, or a dedicated `.project` closeout/release-readiness artifact.

## Definition of Done
- [ ] Release gate artifact created or updated.
- [ ] Local verification command list included.
- [ ] Deferred gates documented.

## Evidence Log
- Pending.
