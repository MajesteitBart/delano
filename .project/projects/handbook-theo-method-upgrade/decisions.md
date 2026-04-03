# Decisions

Track key project decisions with context and rationale.

## 2026-04-03

- `.agents` is the canonical shared runtime and `.claude` is compatibility-only.
  Rationale: handbook, templates, runtime scripts, hooks, and operator docs now point to one shared runtime while preserving fallback paths for Claude-style environments.

- Prototype Probe is modeled as a conditional stage and contract field set, not a new standing skill.
  Rationale: the repo needed explicit uncertainty handling without expanding the skill inventory or inventing runtime directories that do not exist.

- Runtime logs now write to `.agents/logs`, with `.claude` kept in sync as a mirror.
  Rationale: canonical runtime behavior must follow `.agents`, and the compatibility mirror should reflect that behavior rather than define it.
