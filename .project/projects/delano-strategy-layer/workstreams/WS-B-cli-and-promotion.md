---
id: WS-B
name: WS-B CLI and Promotion
owner: bart
status: planned
created: 2026-07-24T00:59:22Z
updated: 2026-07-24T01:03:35Z
operating_mode: multi-stream
---

# Workstream: WS-B CLI and Promotion

## Objective

Deliver a native `delano roadmap` command family whose lifecycle and promotion actions reuse the contract/projection kernel, preserve one authoritative relationship, and cannot leave partial promoted projects.

## Owned Files/Areas

- `src/cli/index.js` roadmap registration and general help
- `src/cli/commands/roadmap.js` command help, parsing, and result formatting
- Shared roadmap mutation/service modules under `src/cli/lib/`
- Narrow promotion integration in `src/cli/lib/project-state.js`
- Project and roadmap templates affected by `roadmap_item`
- CLI unit/integration fixtures and negative-path tests
- This workstream’s task evidence and decisions

## Dependencies

- T-005 depends on WS-A’s validated schema and projection contracts (T-003, T-004).
- T-006 depends on the command/service boundary established by T-005.
- Viewer structured actions may consume the service only after T-006 proves promotion semantics.

## Risks

- Existing project creation writes in place and may leave a partial directory if promotion fails.
- A convenience command can accidentally duplicate lifecycle rules already enforced by validation.
- Promotion inputs can create ambiguous names/outcomes unless required arguments and defaults are explicit.
- Repeated promotions must allow distinct project slugs while rejecting collisions and terminal source items.

## Handoff Criteria

- CLI help documents init, add, show, move, lifecycle, and promote behavior with no scheduling fields.
- Every command emits stable human and JSON output and passes isolated temporary-repository tests.
- Promotion writes `spec.roadmap_item`, leaves the source item byte-identical, and cleans only newly created partial output after failure.
- Terminal promotion, missing item, invalid transition, duplicate project slug, and closure-gate failures are tested.
- The shared service is callable from the viewer without shelling out to the CLI.
