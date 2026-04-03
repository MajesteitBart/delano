---
name: WS-D Verification and Operator Docs
owner: team
status: planned
created: 2026-04-03T12:00:36Z
updated: 2026-04-03T12:00:36Z
---

# Workstream: WS-D Verification and Operator Docs

## Objective

Prove the new CLI behaves safely on the current Windows-first flow and update operator-facing docs so the shipped command surface, install behavior, and bridge story are accurate.

## Owned Files/Areas

- `README.md`
- `docs/user-guide.md`
- package usage/help text and install examples
- smoke-test evidence for install and wrapper-command flows

## Dependencies

- WS-B finalized install behavior
- WS-C finalized wrapper command behavior
- agreed package usage examples and bridge messaging

## Risks

- docs describing install semantics that the CLI does not actually enforce
- incomplete verification around conflict handling and reinstall behavior
- stale bridge guidance causing users to choose the wrong entrypoint

## Handoff Criteria

- docs reflect the actual v1 CLI behavior
- smoke tests cover first install, conflict handling, force mode, and wrapper commands
- release evidence is captured for the Windows-first operator flow
