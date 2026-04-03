---
name: WS-C Wrapper Commands and Legacy Bridge
owner: team
status: in-progress
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:18:28Z
---

# Workstream: WS-C Wrapper Commands and Legacy Bridge

## Objective

Expose the existing PM scripts through `delano init`, `delano validate`, `delano status`, and `delano next`, while keeping `install-delano.sh` usable as a migration bridge.

## Owned Files/Areas

- CLI command modules for `init`, `validate`, `status`, and `next`
- shared subprocess/runtime-discovery helpers
- `install-delano.sh` only where bridge messaging or safe delegation needs adjustment

## Dependencies

- WS-A command dispatch and subprocess foundation
- current behavior of `.agents/scripts/pm/init.sh`, `validate.sh`, `status.sh`, and `next.sh`
- final install direction from WS-B where wrapper docs or bridge messaging overlap

## Risks

- wrappers masking or unintentionally changing script behavior
- Windows `bash` discovery problems surfacing as CLI failures
- leaving the shell installer bridge inconsistent with the npm path

## Handoff Criteria

- wrapper commands delegate to the current PM scripts without rewriting them
- Windows-first execution assumptions are explicit
- the shell installer remains available and its bridge role is clearly defined
