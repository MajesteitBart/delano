---
name: WS-C Runtime Compatibility and Validation
owner: team
status: done
created: 2026-04-02T18:03:17Z
updated: 2026-04-03T06:43:27Z
---

# Workstream: WS-C Runtime Compatibility and Validation

## Objective

Update runtime scaffolding, validation, and shared execution references so the runnable model matches the handbook and docs: `.agents` is canonical, `.claude` remains a compatibility bridge, and validation works in the supported environments.

## Owned Files/Areas

- `.agents/scripts/pm/init.sh`
- `.agents/scripts/pm/validate.sh`
- `install-delano.sh`
- skill contracts and runbooks under `.agents/skills/`
- runtime scripts or rules that still enforce or imply `.claude` as canonical

## Dependencies

- WS-A and WS-B agreed target language
- decision on Windows-compatible validator fallback for dependency-cycle checking
- final inventory of retained `.claude` references that should stay as compatibility examples

## Risks

- breaking existing `.claude`-based workflows while moving canonical references to `.agents`
- overlooking stale path references in automation, logs, or script help text
- leaving validation green only on Unix-like environments

## Handoff Criteria

- `pm/init.sh` emits scaffolds that match the updated templates
- `pm/validate.sh` treats `.agents` as canonical, tolerates `.claude` compatibility, and passes in this environment
- retained `.claude` references are clearly compatibility-only
- installer output and runtime help text reinforce the same canonical path model
