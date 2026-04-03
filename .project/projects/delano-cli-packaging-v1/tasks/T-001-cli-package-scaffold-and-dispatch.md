---
id: T-001
name: CLI package scaffold and dispatch
status: ready
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:00:36Z
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

Create the initial npm package structure for `@delano/cli`, including `package.json`, the `delano` binary entrypoint, command parsing, and shared helpers for dispatching subcommands.

## Acceptance Criteria
- [ ] `package.json` defines the `@delano/cli` package and `delano` binary.
- [ ] `bin/delano.js` delegates into a small CLI source tree instead of holding all logic inline.
- [ ] The CLI can parse and route the planned v1 commands: `install`, `init`, `validate`, `status`, and `next`.
- [ ] Shared command helpers are in place for future install and subprocess execution work.

## Technical Notes

- Prefer plain Node JS unless TypeScript remains essentially free.
- Keep the command surface thin and avoid embedding PM-script logic directly in the dispatcher.
- Reserve write ownership for package metadata, the binary entrypoint, and the CLI source tree.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
