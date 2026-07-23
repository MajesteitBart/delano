---
name: WS-A CLI Package Scaffold and Dispatch
owner: team
status: done
created: 2026-04-03T12:00:36Z
updated: 2026-04-28T22:08:32Z
---

# Workstream: WS-A CLI Package Scaffold and Dispatch

## Objective

Create the npm package skeleton, binary entrypoint, command dispatch, and shared execution helpers needed for the Delano CLI without re-hosting the runtime logic.

## Owned Files/Areas

- `package.json`
- `bin/delano.js`
- `src/cli/`
- shared CLI argument parsing and subprocess helpers

## Dependencies

- approved spec and command surface
- decision to keep v1 in plain Node JS unless TypeScript remains nearly free
- current PM script interface under `.agents/scripts/pm/`

## Risks

- over-engineering the command framework into a harness
- coupling command parsing too tightly to install-specific logic
- introducing Windows subprocess assumptions that do not hold in practice

## Handoff Criteria

- package metadata and binary entrypoint exist
- command dispatch is clear and easy to extend
- install and wrapper commands have a stable shared execution foundation
