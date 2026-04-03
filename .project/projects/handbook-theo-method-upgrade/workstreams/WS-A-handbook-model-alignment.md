---
name: WS-A Handbook Model Alignment
owner: team
status: planned
created: 2026-04-02T18:03:17Z
updated: 2026-04-02T18:03:17Z
---

# Workstream: WS-A Handbook Model Alignment

## Objective

Update `HANDBOOK.md` so the operating model, lifecycle, repo structure, workflow stages, decision framework, role playbooks, templates section, and migration guidance match the v2.1 proposal and the repo's actual `.agents` adapter model.

## Owned Files/Areas

- `HANDBOOK.md`
- handbook sections 1, 3, 5, 6, 7, 8, 9, 15, 16, 17, and 18

## Dependencies

- approved source briefing embodied in `spec.md`
- decision to keep existing stage skill inventory unchanged
- agreement that `.claude` remains compatibility-only

## Risks

- introducing handbook language that over-promises validator enforcement
- adding structure references that do not exist in the repo
- updating primary flow language without carrying the same terminology through downstream sections

## Handoff Criteria

- handbook is internally consistent end-to-end
- `.agents` is described as canonical shared runtime and `.claude` only as a compatibility bridge
- Prototype Probe and spec approval flow are represented across lifecycle, workflow, templates, and role sections
- no new canonical directories are documented unless they exist in the repo
