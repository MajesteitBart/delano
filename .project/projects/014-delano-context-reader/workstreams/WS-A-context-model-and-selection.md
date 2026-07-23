---
id: WS-A
name: WS-A Context Model And Selection
owner: product
status: done
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:29:22Z
---

# Workstream: WS-A Context Model And Selection

## Objective

Define the logical contract for `.project/context` reading: canonical file order, required/missing semantics, profiles, selector rules, output fields, and max-size behavior.

## Owned Files/Areas

- `.project/context/README.md` convention analysis
- context profile definitions
- context-reader output schema
- implementation notes that feed `src/cli` work

## Dependencies

- Current Delano context starter files and viewer indexing behavior.

## Risks

- Profile names become public API before they are useful enough.
- README-derived order may vary across repos and need a fallback.
- A too-clever selector model could make agent usage harder instead of easier.

## Handoff Criteria

- Canonical order and fallback order are documented.
- v1 profiles are explicitly named and mapped to files.
- JSON and markdown output shape is specified.
- Missing-file and strict/non-strict behavior is decided.
- T-002 can implement without guessing product semantics.
