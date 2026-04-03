# Product Context

## Users
- Maintainers evolving Delano's handbook, runtime, and installer behavior.
- Operators adding Delano to existing repositories and using the PM/runtime scripts day to day.
- Coding agents working through Delano's shared contracts and adapter notes instead of tool-specific process variants.

## Core Flows
- Start with an outcome, draft a spec, make the probe decision explicit, plan workstreams, decompose tasks, execute, validate, and close out with evidence.
- Install Delano into a repository, then operate primarily through `.project/` contracts and `.agents/scripts/pm/*`.
- Use `validate`, `status`, `next`, and related scripts to keep delivery state coherent and dependency-safe.

## Constraints
- Delano must stay agent-agnostic and protocol-first rather than becoming a proprietary execution host.
- `.project` remains the source of truth for delivery state.
- `.agents` remains the canonical runtime and `.claude` is compatibility only.
- `.delano` remains optional and must not become process truth.
