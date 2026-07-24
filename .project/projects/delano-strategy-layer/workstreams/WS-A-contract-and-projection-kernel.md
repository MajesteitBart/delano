---
id: WS-A
name: WS-A Contract and Projection Kernel
owner: bart
status: done
created: 2026-07-24T00:59:21Z
updated: 2026-07-24T06:48:54Z
operating_mode: multi-stream
---

# Workstream: WS-A Contract and Projection Kernel

## Objective

Define the smallest truthful strategy contract: optional direction context, validated roadmap items, one-way project traceability, and a deterministic projection for reverse links, delivery receipts, closure eligibility, and staleness.

## Owned Files/Areas

- `.agents/schemas/artifact-scope.json` and roadmap artifact/rule schemas
- Canonical roadmap rule documentation and validator wiring in `.agents/scripts/pm/validate.sh`
- Roadmap/context seed templates under `.project/templates/`
- `src/cli/lib/context-reader.js` optional-profile behavior
- Shared roadmap parsing/projection modules under `src/cli/lib/`
- Focused contract, fixture, context-reader, and projection tests
- This workstream’s task evidence and decisions

## Dependencies

- Planned spec and decisions D-005 through D-014.
- T-001 establishes the artifact/lifecycle vocabulary before T-003 or T-004.
- T-002 is independent of the roadmap schema and may run in parallel.
- No CLI or viewer mutation may ship before T-003 validation semantics exist.

## Risks

- Fixed context profile behavior can introduce warnings for repositories that did not opt in.
- Artifact requirements are encoded in multiple schema, validator, fixture, template, and package surfaces.
- Cross-project scans can become nondeterministic or slow if projection code reads Git or filesystem state outside `.project`.
- Closure and staleness can overstate truth unless clock and lifecycle inputs are explicit.

## Handoff Criteria

- Repositories with and without direction/roadmap files pass their expected focused fixtures.
- Roadmap schema, lifecycle matrix, body sections, cross-reference rules, and closure gate agree.
- Reverse links and receipt/staleness output are pure, deterministic, source-linked, and covered by edge-case tests.
- Vision/mission appear in overview context only when present and produce no absent-file warning.
- T-003 and T-004 expose stable APIs and error messages for CLI and viewer consumers.

## Updates

- 2026-07-24T06:48:54Z: Quality gate: WS-A handoff passes; project release gate awaits WS-D mirror and package payload integration.

- 2026-07-24T06:35:24Z: Begin contract and projection kernel execution
