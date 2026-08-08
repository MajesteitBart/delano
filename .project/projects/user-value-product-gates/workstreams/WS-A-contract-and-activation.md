---
id: WS-A
name: WS-A Contract and Activation
owner: bart
status: planned
created: 2026-08-08T20:17:15Z
updated: 2026-08-08T20:17:29Z
operating_mode: multi-stream
---

# Workstream: WS-A Contract and Activation

## Objective

Define and enforce a mode-scaled value contract that makes product, mixed, and infrastructure scope honest before activation, using a short `boil-it-down` intervention and a non-destructive legacy migration path.

## Owned Files/Areas

- Operating-mode, artifact, and lifecycle schemas/rules for value-contract version and classification
- Spec template and activation/approval decision shape
- New `boil-it-down` skill plus discovery/planning integration
- Project start/validation preconditions and migration entry point
- Focused contract, CLI, migration, privacy, and no-write-on-failure tests
- WS-A task evidence and decisions

## Dependencies

- Planned spec, research findings, and decisions D-001 through D-015.
- Required prototype and owner decisions must complete before any WS-A task is promoted from `planned`.
- T-001 stabilizes vocabulary; T-002 and T-004 may follow in parallel; T-003 consumes T-001 and T-002.

## Risks

- Classification can become a bypass if infrastructure has weaker but vague obligations.
- A source-hash review can provide freshness without proving human identity; docs and UI must not overclaim.
- Requiring new sections on every historical project would break compatibility and incentivize fake backfill.
- A verbose skill would recreate the process problem it is meant to stop.

## Handoff Criteria

- New modes 2 through 4 cannot activate without a current value contract and applicable owner/reviewer decision; failure writes nothing.
- Product/mixed and infrastructure branches have explicit, tested obligations and no silent bypass.
- `boil-it-down` changes or stops canonical scope and cannot satisfy failure by producing another report.
- Modes 0 and 1 remain light; terminal history validates unchanged; planned/active migration behavior is explicit and idempotent.
- Stable contract/service outputs are ready for WS-B and WS-C consumers.
