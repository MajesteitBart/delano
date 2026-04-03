---
id: T-001
name: Handbook model alignment
status: done
created: 2026-04-03T06:43:27Z
updated: 2026-04-03T06:43:27Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Handbook model alignment

## Description

Update `HANDBOOK.md` so the canonical runtime model, probe-aware flow, lifecycle rules, playbooks, templates, and migration guidance align with the repo's actual `.agents`-first structure.

## Acceptance Criteria
- [x] `HANDBOOK.md` describes `.agents` as canonical and `.claude` as compatibility-only.
- [x] Probe-aware delivery is represented across flow, contracts, workflow, and role sections.
- [x] Handbook templates and migration guidance match the shipped runtime and scaffolds.

## Technical Notes

- Updated handbook sections 1, 3, 5, 6, 7, 8, 9, 15, 16, 17, and 18.
- Kept the stage skill inventory intact while introducing a conditional Prototype Probe stage.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Updated `HANDBOOK.md` to the `.agents`-first, probe-aware model and verified no conflicting canonical-path guidance remained in the handbook.
