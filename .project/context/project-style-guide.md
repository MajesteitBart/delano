# Project Style Guide

## Naming
- Use kebab-case for project slugs under `.project/projects/`.
- Use `WS-<letter>` for workstream identifiers and `T-###` for task identifiers.
- Keep adapter/runtime references explicit: `.agents` for canonical paths, `.claude` only when discussing compatibility behavior.

## Documentation Conventions
- Keep context files short, factual, and current enough for another operator or agent to resume work without rediscovery.
- Use handbook terminology consistently: outcome, spec, probe decision, workstream, task, evidence, and closeout.
- Frontmatter timestamps must be ISO8601 UTC.
- Do not leak machine-specific absolute paths into shared docs or contracts.

## Review Expectations
- Changes that touch contracts, templates, runtime scripts, or user-facing docs should be checked for cross-artifact consistency, not reviewed in isolation.
- Run `bash .agents/scripts/pm/validate.sh` after modifying delivery artifacts or runtime behavior.
- When planning install or packaging work, prefer conflict-first and non-destructive behavior by default.
