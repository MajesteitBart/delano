# Project Style Guide

## Naming
- Use kebab-case for project slugs under `.project/projects/`.
- Use `WS-<letter>` for workstream identifiers and `T-###` for task identifiers.
- Keep adapter/runtime references explicit: `.agents` for canonical paths, `.claude` only when discussing compatibility behavior.
- Use repo-relative paths in docs, updates, logs, and viewer handovers unless an operator explicitly asks for local machine details.

## Documentation Conventions
- Keep context files short, factual, and current enough for another operator or agent to resume work without rediscovery.
- Use handbook terminology consistently: outcome, spec, probe decision, workstream, task, evidence, and closeout.
- Frontmatter timestamps must be ISO8601 UTC.
- Do not leak machine-specific absolute paths into shared docs or contracts.
- Avoid hard-wrapping Markdown prose. Prefer concise bullets for context files and direct evidence statements for updates.
- Name uncertainty plainly. Do not rewrite unknowns as confirmed facts just to make a handoff look complete.

## Review Expectations
- Changes that touch contracts, templates, runtime scripts, or user-facing docs should be checked for cross-artifact consistency, not reviewed in isolation.
- Run `node bin/delano.js validate` after modifying delivery artifacts or runtime behavior in this Windows worktree. Run `bash .agents/scripts/pm/validate.sh` when a real Bash runtime is available.
- Run `npm run check:context-audit` after modifying `.project/context/`.
- For viewer source changes, run focused checks first: `npm --prefix .delano/viewer/ui run typecheck`, `npm --prefix .delano/viewer/ui run build`, `node --test test/viewer-server.test.js`, then package checks when built assets change.
- When planning install or packaging work, prefer conflict-first and non-destructive behavior by default.

## Viewer UI Conventions
- Preserve the quiet Delano/Keendoc design language: warm off-white surfaces, near-black ink, hairline borders, small radii, restrained status color, Inter-like sans text, and JetBrains-like monospace for IDs and paths.
- Use shadcn/Radix primitives through `.delano/viewer/ui/src/components/ui`; keep Delano-specific orchestration in atoms, molecules, organisms, pages, app hooks, and domain helpers.
- Do not introduce gradients, heavy shadows, nested decorative cards, or visible technical implementation notes into the product surface.
