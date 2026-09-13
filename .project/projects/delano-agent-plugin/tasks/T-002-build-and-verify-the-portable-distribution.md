---
id: T-002
name: Build and verify the portable distribution
status: done
workstream: WS-A
created: 2026-09-12T19:48:22Z
updated: 2026-09-12T20:02:37Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: feature
story_id:
acceptance_criteria_ids: []
---

# Task: Build and verify the portable distribution

## Description

Build a relocatable package and guard its distribution boundary.

## Acceptance Criteria

- [x] A repeatable build produces compatibility metadata and an installable archive.
- [x] Package validation rejects missing or escaping resources and a relocated package passes.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes

Keep the package independent of the deleted agent runtime. No publishing or client installation is included.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-09-12T20:02:37Z: npm run test:plugin passed all 5 distribution tests. npm run pack:plugin generated output/bvdm-delano-plugin-0.1.0.tgz containing 24 files; the extracted archive passed resource and compatibility validation. Generated text now uses LF after a clean-checkout regression exposed license newline drift.

- 2026-09-12T20:02:37Z: Execute dependency-ready packaging task.
- 2026-09-12T19:48:22Z: Created from .project/templates/task.md by `delano task add`.
