---
name: Delano Trust and Safety Runtime
slug: delano-trust-safety-runtime
owner: bart
status: planned
created: 2026-04-28T23:14:00Z
updated: 2026-04-28T23:14:00Z
outcome: Delano has safer defaults for logging, path output, package metadata, and agent entry instructions so operators can trust the runtime before deeper contract automation lands.
uncertainty: medium
probe_required: true
probe_status: not-started
---

# Spec: Delano Trust and Safety Runtime

## Executive Summary
- Convert the roadmap review's immediate trust findings into a focused delivery project.
- Reduce privacy risk by making prompt logging opt-in and redacted by default.
- Tighten release/package metadata checks so stale artifacts cannot silently undermine confidence.
- Make the root agent entrypoint compact, operational, and aligned with current Delano commands.


## Problem and Users
- Delano already describes a serious agentic delivery operating system, but several roadmap findings show gaps between the handbook promise and enforceable runtime behavior.
- Primary users are Delano maintainers and operators who need delivery state to stay trustworthy across agents, sessions, and repositories.
- Secondary users are coding agents that need precise contracts, safe defaults, and validation feedback instead of relying on memory or informal process compliance.

## Outcome and Success Metrics
- The project produces concrete runtime assets, project contracts, validation checks, fixtures, docs, or commands that close the roadmap gap named in this spec.
- Work can be validated locally without depending on a specific agent vendor.
- Any new write-capable flow has a dry-run or explicit confirmation path where appropriate.
- Completion evidence maps directly to the acceptance criteria in the project tasks.

## Scope
### In Scope
- Project contracts and implementation tasks needed for this roadmap phase.
- Updates to Delano runtime assets when tasks are implemented.
- Validation, fixtures, and documentation that make the behavior repeatable.

### Out of Scope
- Implementing every roadmap phase in one delivery pass.
- Public release or npm publishing unless a task explicitly promotes it.
- Remote mutations to GitHub, Linear, or other systems without an explicit operator-approved apply path.

## Functional Requirements
- Preserve `.project` as the delivery source of truth.
- Keep `.agents` as the runtime asset layer.
- Prefer explicit contracts over agent-specific behavior.
- Capture evidence before claiming task or project completion.

## Non-Functional Requirements
- Privacy-safe by default.
- Auditable and easy to validate.
- Compatible with current Delano project conventions.
- Small changes should not require unnecessary ceremony once operating modes exist.

## Hypotheses and Unknowns
- The roadmap findings are directionally correct, but each implementation task should re-check current repo state before editing runtime assets.
- Some remote sync and multi-agent behaviors may require probes or mocked fixtures before production-quality implementation.
- Schema and validation work may uncover inconsistencies in existing project artifacts that need migration decisions.

## Dependencies
- Existing Delano handbook, `.project` contracts, PM scripts, runtime assets, and CLI package surface.
- Current Node and shell tooling used by the repository.
- Optional GitHub or Linear credentials only for later apply-capable sync work.

## Acceptance Criteria
- [ ] Project tasks are represented as Delano task contracts.
- [ ] Workstreams identify owned files or runtime areas before implementation begins.
- [ ] Validation can run after contract creation.
- [ ] Implementation tasks include evidence requirements in their Definition of Done.
