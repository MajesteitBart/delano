---
id: T-005
name: Add acceptance-criteria evidence mapping
status: done
workstream: WS-C
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T23:45:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Add acceptance-criteria evidence mapping

## Description
Represent evidence items and enforce every acceptance criterion has acceptable proof before done.

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
- 2026-04-29T23:45:00Z: Inspected done task contracts and acceptance criteria shape. Added `.agents/schemas/evidence-map.json`, `scripts/check-evidence-map.mjs`, runtime script mirrors, PM validation wiring, package script, install manifest entries, and npm test coverage to enforce mapped evidence proof for done tasks updated after the strict cutoff. Validation passed: `npm run check:evidence-map`; `.agents/scripts/pm/validate.sh`; `npm test`.
