# Product Context

## Users
- Maintainers evolving Delano's handbook, runtime, and installer behavior.
- Operators adding Delano to existing repositories and using the PM/runtime scripts day to day.
- Coding agents working through Delano's shared contracts and adapter notes instead of tool-specific process variants.
- Reviewers using the guarded viewer to read `.project` markdown, annotate exact passages, and hand scoped feedback to Codex or Claude Code.

## Core Flows
- Start with an outcome, draft a spec, make the probe decision explicit, plan workstreams, decompose tasks, execute, validate, and close out with evidence.
- Install Delano into a repository, then operate primarily through `.project/` contracts and `.agents/scripts/pm/*`.
- Use `validate`, `status`, `next`, and related scripts to keep delivery state coherent and dependency-safe.
- Use `delano context list` and `delano context read --profile implementation` to orient agents from the shared context pack without leaking machine-local paths.
- Use `delano viewer` to inspect contracts, create review annotations, export feedback, or create handover files and agent commands.
- Use viewer handover `start` intent to dispatch implementation from task/workstream contracts and `review` intent to verify delivered work against acceptance criteria and evidence.

## Constraints
- Delano must stay agent-agnostic and protocol-first rather than becoming a proprietary execution host.
- `.project` remains the source of truth for delivery state.
- `.agents` remains the canonical runtime and `.claude` is compatibility only.
- `.delano` remains optional and must not become process truth.
- Viewer annotation and handover artifacts are local review aids. They do not replace task evidence, lifecycle updates, or explicit markdown apply gates.
- Hosted sharing, multi-user collaboration, and direct unreviewed contract mutation are outside the current viewer safety model.
