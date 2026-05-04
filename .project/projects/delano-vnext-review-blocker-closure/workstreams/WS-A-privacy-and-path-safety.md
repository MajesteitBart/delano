---
name: WS-A Privacy and Path Safety
owner: bart
status: done
created: 2026-05-04T09:25:06Z
updated: 2026-05-04T09:35:25Z
---

# Workstream: WS-A Privacy and Path Safety

## Objective

Remove the remaining local path leak and make validation catch WSL-style absolute path leakage before release.

## Owned Files/Areas

- `.project/projects/delano-vnext-runtime-upgrade/spec.md`
- `.agents/scripts/pm/validate.sh`
- `.agents/scripts/check-path-standards.sh`
- `.agents/scripts/fix-path-standards.sh`
- `.agents/validation-fixtures/strict/`
- `.claude/` mirrored runtime assets where applicable

## Dependencies

- Current vNext spec and path-safety scripts.
- Existing log/path safety validation.

## Risks

- Test fixtures can accidentally introduce real local path examples.
- Path regexes can become noisy if they match URLs or non-path text.

## Handoff Criteria

- No user-specific absolute path remains in project contracts.
- WSL drive-mount path leakage is covered by validation and fixtures.
- Mirrored compatibility runtime assets stay in sync when applicable.
