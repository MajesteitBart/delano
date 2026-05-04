---
name: WS-D Validation and CI Gates
owner: bart
status: done
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
---

# Workstream: WS-D Validation and CI Gates

## Objective

Repair the currently failing local gates and add CI so blocker closure is enforced on future pull requests.

## Owned Files/Areas

- `test/package.test.js`
- `scripts/build-drift-report.mjs`
- `scripts/check-context-audit.mjs`
- `.agents/scripts/pm/validate.sh`
- `.github/workflows/`
- Release-gate documentation touched by validation commands

## Dependencies

- Package and payload drift must be resolved before final CI enforcement.
- Handbook/contract alignment should complete before final gate closeout.

## Risks

- Local shell differences can make validation appear broken on one Windows environment and green on another.
- CI may need repository settings outside local files.

## Handoff Criteria

- Local validation commands pass in the supported environment.
- CI runs the release-blocking validation commands.
- Final closeout evidence states exactly what passed and what, if anything, remains externally blocked.
