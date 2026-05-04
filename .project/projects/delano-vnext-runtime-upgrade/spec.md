---
name: Delano vNext Runtime Upgrade
slug: delano-vnext-runtime-upgrade
owner: bart
status: complete
created: 2026-04-29T21:57:00Z
updated: 2026-04-30T02:52:00Z
outcome: Ship Delano v0.2 as a contract-verified, privacy-safe, agent-agnostic delivery runtime rather than only a handbook-led process.
uncertainty: medium
probe_required: true
probe_status: completed
target_version: 0.2.0
source_review: tmp/review_vnext.md
external_reference: https://developers.openai.com/api/docs/guides/prompt-guidance
---

# Spec: Delano vNext Runtime Upgrade

## Executive Summary

The review concludes that Delano has the right architecture for serious agentic software delivery: local contracts in `.project`, runtime assets in `.agents`, probe-before-build, evidence-backed closure, context continuity, and vendor neutrality.

The next version should not be a larger handbook. It should make Delano's promises mechanically true. v0.2 should introduce the first coherent runtime layer for contract validation, evidence gates, privacy-safe logging, sync drift detection, multi-agent coordination, and learning/evaluation loops.

This project is the version-level umbrella for that work. The implementation should be split into focused child delivery projects already represented in `.project/projects/`:

1. `delano-trust-safety-runtime`
2. `delano-contract-enforcement`
3. `delano-operational-sync`
4. `delano-multi-agent-execution`
5. `delano-learning-loop`

## Problem and Users

Delano currently describes a mature delivery operating system better than it enforces one. Agents can still skip gates, mark work complete without proof, rely on stale context, collide in files, log sensitive prompts, or let GitHub/Linear drift away from local truth.

Primary users:
- Delano maintainers developing the runtime.
- Operators using Delano across real repositories.
- Coding agents that need precise, compact, enforceable instructions and validation feedback.

## Product Decision

Add this as a **separate version project**, not as one giant implementation task.

Reasoning:
- The review spans multiple runtime domains with different risk profiles.
- A version-level project gives Bart one roadmap and release target.
- Child projects keep implementation atomic and parallelizable.
- The structure matches Delano's own handbook: outcome -> approved spec -> delivery projects -> workstreams -> tasks -> release -> learnings.

## Outcome and Success Metrics

v0.2 is successful when:
- Delano can validate core `.project` artifacts with schemas and strict gates.
- `done` cannot be claimed without acceptance/evidence mapping.
- Raw prompt logging is opt-in and redacted by default.
- Package/install metadata drift is caught before release.
- A dry-run sync report can identify local/GitHub/Linear drift without mutating remotes.
- Multi-agent file ownership can be represented and validated through leases.
- Context health and skill-output quality can be evaluated with fixtures.
- Root and adapter agent instructions are concise, outcome-first, and operational.

## Scope

### In Scope

- v0.2 release definition and sequencing.
- Child project coordination across the five roadmap areas.
- Contract schemas, validators, fixtures, and CLI wiring needed for the first enforceable runtime.
- Privacy/logging safety fixes before deeper automation.
- Prompt/instruction upgrades informed by current OpenAI prompt guidance.
- Dry-run-first sync and repair planning.
- Lease-based multi-agent coordination.
- Evaluation and context-audit foundations.

### Out of Scope

- Full enterprise portfolio management.
- Mandatory Linear or GitHub remote writes without explicit operator-approved apply gates.
- Rewriting Delano around any single agent vendor.
- Turning Delano into a dashboard-first system.
- Solving every future handbook maturity gate in v0.2.

## Prompt Guidance Considerations

The OpenAI prompt guidance changes the agent-instruction strategy for vNext:

- Prefer **short, outcome-first instructions** over process-heavy prompt stacks.
- Define good results, constraints, evidence, tool boundaries, and final-answer expectations.
- Keep personality/collaboration style compact and separate from operational rules.
- Re-evaluate default reasoning/tool budgets before escalating to heavy workflows.
- For tool-heavy runs, preserve preambles, phase handling, and assistant-item replay where the runtime supports them.
- Add explicit retrieval budgets, validation rules, and stopping conditions for agentic workflows.
- Avoid migrating old instructions wholesale. Rewrite root and adapter docs to be compact retrieval indexes with clear commands and completion gates.

This means v0.2 should improve `AGENTS.md`, adapter docs, and skill trigger criteria without bloating them.

## Functional Requirements

- Preserve `.project` as delivery truth.
- Preserve `.agents` as reusable runtime assets.
- Support agent-neutral contracts first, adapter-specific behavior second.
- Provide strict validation for schemas, status transitions, dependencies, blockers, evidence, and selected safety rules.
- Use dry-run outputs before remote or destructive changes.
- Keep logs privacy-safe by default.
- Make version readiness testable through fixtures and CI/package checks.

## Non-Functional Requirements

- Agent-agnostic and local-first.
- Privacy-safe by default.
- Small enough to ship as v0.2 without boiling the ocean.
- Compatible with existing Delano installations after migration guidance.
- Clear failure messages that help agents self-correct.

## Hypotheses and Unknowns

- JSON Schema plus targeted custom validators may be enough for v0.2; a more formal state-machine engine may wait.
- GitHub sync can likely be implemented before Linear apply flows because local git/PR data is easier to inspect.
- Linear integration should start as schema + mocked fixture + dry-run report unless credentials/API shape are confirmed.
- Prompt guidance can simplify agent docs, but must not remove concrete commands and evidence gates.

## Dependencies

- Existing Delano package and CLI (`@bvdm/delano` currently at 0.1.7).
- Existing `.project` templates and PM scripts.
- Existing planned child projects generated from the review.
- Optional GitHub/Linear credentials only for later real adapter probes.

## Acceptance Criteria

- [x] This version project links the review findings to concrete child delivery projects.
- [x] Each child project has spec, plan, workstreams, tasks, and clear evidence expectations.
- [x] v0.2 release readiness can be checked with local commands.
- [x] Agent instruction updates follow outcome-first prompt guidance while retaining commands and safety boundaries.
- [x] Trust/safety fixes land before sync/apply-capable automation.
- [x] Final closeout states exactly what is included in v0.2 and what moves to later versions.


## v0.2 Closeout Scope

Included in v0.2:
- Privacy-safe prompt/log defaults and path-output safety.
- Package manifest/payload drift validation.
- Artifact schemas, operating modes, status-transition validation, evidence mapping, and strict fixtures.
- Dry-run local/GitHub/Linear sync inspection, drift reporting, and apply-gated repair planning.
- Lease lifecycle, conflict-zone validation, stream-aware task selection, handoff checks, and worktree health.
- Delivery metric events, project metrics summaries, context audit scoring, skill-output eval fixtures, validation wiring, and reviewed closeout learning proposals.
- Compact root/adapter agent instructions with shared operational rules in `AGENTS.md`.

Deferred beyond v0.2:
- Remote GitHub/Linear writes without explicit apply gates.
- Dashboard-first or enterprise portfolio surfaces.
- Broader state-machine orchestration beyond targeted validators.

Npm publication now runs through GitHub Actions trusted publishing once the npm package settings authorize `.github/workflows/publish-npm.yml`.

Release gates are documented in `release-gates.md`.
