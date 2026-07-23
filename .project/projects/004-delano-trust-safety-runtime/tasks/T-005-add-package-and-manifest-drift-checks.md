---
id: T-005
name: Add package and manifest drift checks
status: done
workstream: WS-C
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T22:55:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add package and manifest drift checks

## Description
Fail validation or CI when package metadata, generated pack metadata, manifest entries, and payload files diverge.

## Acceptance Criteria
- [x] Current repo state has been inspected before implementation starts.
- [x] The delivered change is represented in Delano runtime assets, project contracts, validation, fixtures, or docs as appropriate.
- [x] The change is validated with the smallest meaningful command or fixture.
- [x] Evidence is recorded in this task or a task update before the task is marked done.

## Technical Notes
- This task came from the Delano next-step roadmap review.
- Keep behavior additive or dry-run-first when the task touches validation, remote sync, logs, or write-capable commands.
- Do not claim completion from documentation alone unless the task is explicitly documentation-only.

## Definition of Done
- [x] Implementation or contract creation complete
- [x] Validation or focused test passes
- [x] Review complete
- [x] Docs updated where behavior changes

## Evidence Log
- 2026-04-28T23:14:00Z: Task created from roadmap review; implementation evidence pending.
- 2026-04-29T22:55:00Z: Inspected current package/runtime state (`git status`, `package.json`, `assets/install-manifest.json`, existing package tests, PM validation). Added `scripts/check-package-manifest-drift.mjs`, wired it into `npm run check:package-manifest`, PM validation, and `node --test` coverage. The check verifies package metadata, manifest source validity, generated payload membership, and source-to-payload byte drift. Validation passed: `npm run build:assets`, `npm run check:package-manifest`, `bash .agents/scripts/pm/validate.sh`, and `npm test` (12/12).
