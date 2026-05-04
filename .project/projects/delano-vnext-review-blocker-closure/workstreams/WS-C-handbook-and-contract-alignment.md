---
name: WS-C Handbook and Contract Alignment
owner: bart
status: done
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
---

# Workstream: WS-C Handbook and Contract Alignment

## Objective

Make the central handbook, schemas, templates, validators, and current artifacts tell one consistent story about v0.2 runtime behavior.

## Owned Files/Areas

- `HANDBOOK.md`
- `.agents/schemas/`
- `.project/templates/`
- `.project/projects/*`
- Runtime validation scripts that enforce status and artifact contracts

## Dependencies

- Canonical status-model decision.
- Current schema and template behavior.

## Risks

- Status changes can create cross-project migration work.
- Documentation can overclaim behavior that is still intentionally deferred.

## Handoff Criteria

- Status values are aligned across handbook, schemas, templates, validators, and current artifacts.
- The handbook documents operating modes, validation posture, evidence expectations, dry-run sync, leases, and deferred maturity gates accurately.
