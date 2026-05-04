---
id: T-002
name: Make raw prompt logging opt-in and redacted
status: done
workstream: WS-A
created: 2026-04-28T23:14:00Z
updated: 2026-04-29T22:36:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Make raw prompt logging opt-in and redacted

## Description
Disable raw prompt persistence by default and store only safe summaries or hashes unless explicitly enabled.

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
- 2026-04-29T22:36:00Z: Added `.agents/common/log-safety.js`, changed prompt logging to hash/length/redaction metadata by default, added opt-in flags for redacted/raw prompt text, synced `.claude` compatibility files, rebuilt npm payload assets. Validation: focused temp-dir prompt logger checks passed; `.agents/scripts/pm/validate.sh` passed; `npm test` passed (11 tests).
