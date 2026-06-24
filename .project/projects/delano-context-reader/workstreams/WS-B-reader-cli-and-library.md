---
id: WS-B
name: WS-B Reader CLI And Library
owner: engineering
status: planned
created: 2026-06-24T21:51:46Z
updated: 2026-06-24T21:51:46Z
---

# Workstream: WS-B Reader CLI And Library

## Objective

Implement the safe context reader as a reusable library/helper and expose it through a clean Delano CLI command surface.

## Owned Files/Areas

- `bin/delano.js`
- `src/cli/index.js`
- `src/cli/commands/`
- `src/cli/lib/`
- package manifest/payload updates if new files are shipped

## Dependencies

- WS-A context model, selector rules, and output schema.

## Risks

- CLI syntax could sprawl beyond listing and reading.
- Path-safety behavior may differ across platforms if not tested carefully.
- New files may require package manifest/payload updates before validation passes.

## Handoff Criteria

- Context reader library is deterministic and side-effect free.
- CLI supports list/read behavior in human and JSON modes.
- Unsafe selectors fail closed with clear errors.
- Output limits and warnings are implemented.
- Unit tests and package-manifest checks pass.
