---
id: T-001
name: CLI package scaffold and dispatch
status: done
workstream: WS-A
created: 2026-04-03T12:00:36Z
updated: 2026-04-28T22:08:32Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: CLI package scaffold and dispatch

## Description

Create the initial npm package structure for `@bvdm/delano`, including `package.json`, the `delano` binary entrypoint, command parsing, and shared helpers for dispatching subcommands.

## Acceptance Criteria
- [x] `package.json` defines the `@bvdm/delano` package and `delano` binary.
- [x] `bin/delano.js` delegates into a small CLI source tree instead of holding all logic inline.
- [x] The CLI can parse and route the planned v1 commands: `install`, `init`, `validate`, `status`, and `next`.
- [x] Shared command helpers are in place for future install and subprocess execution work.

## Technical Notes

- Prefer plain Node JS unless TypeScript remains essentially free.
- Keep the command surface thin and avoid embedding PM-script logic directly in the dispatcher.
- Reserve write ownership for package metadata, the binary entrypoint, and the CLI source tree.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Added `package.json`, `bin/delano.js`, the `src/cli/` command-dispatch tree, and shared runtime helpers. Verified global help and command routing with `npm test` and `node bin/delano.js --help`.
- 2026-04-03: Renamed the published package identifier to `@bvdm/delano`.
- 2026-04-28: Marked done after operator confirmation and final package verification rerun.
