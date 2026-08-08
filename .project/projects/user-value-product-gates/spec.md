---
name: Delano User Value and Product Quality Gates
slug: user-value-product-gates
owner: bart
status: planned
created: 2026-08-08T20:16:34Z
updated: 2026-08-08T20:17:29Z
outcome: Meaningful Delano projects cannot activate, advance past value checkpoints, or close while the named user's representative job remains unproven; product surfaces receive human UX judgment and infrastructure remains explicitly bounded.
uncertainty: high
probe_required: true
probe_status: pending
probe_decision_rationale: A time-boxed behavior probe must prove the proposed gates stop the Kotlin regression without falsely blocking honest infrastructure or small changes.
operating_mode: multi-stream
---

# Spec: Delano User Value and Product Quality Gates

## Executive Summary

Delano protects contract integrity, dependency safety, test evidence, and closeout bookkeeping. It does not yet protect the user from a technically conformant project whose finished product cannot perform its stated job. The failed Kotlin Android foundation project is the regression case: substantial transport, persistence, reconciliation, supervision, idempotency, credential, test, and evidence work was real, yet the delivered surface could only browse environments, projects, and thread names. It exposed no transcript, creation, response, or meaningful agent-supervision workflow and still accumulated passing gates.

This project makes user value and product quality lifecycle constraints for meaningful work. Modes 2 through 4 must state a named user, intended job, observable new capability, explicit non-capabilities, delivery classification, and representative end-to-end demo before activation. Plans must prove a thin vertical user outcome early and explain the proportionality of invisible work. Execution must re-boil at declared value-risk boundaries and stop when scope cannot deliver the job or working demo capability has not advanced. Product closeout must run the demo on representative real data and receive human judgment of information architecture, copy, contextual actions, data usefulness, and interaction quality.

The mechanism is layered because no schema can judge value by itself. Deterministic lifecycle checks make omissions and unresolved gates hard to bypass; short skills make agents confront scope and stop; behavioral fixtures and human product review test whether the promised job actually works. Legitimate infrastructure remains allowed, but it cannot masquerade as user payoff.

## Problem and Users

Primary users are Delano project owners approving spend and scope, operators supervising delivery, coding agents executing tasks, and reviewers deciding whether an outcome is ready to close.

The current system has four gaps:

- An outcome can be entirely machine-facing while the stated end user gains no useful capability.
- Plans can sequence foundations, integrations, tests, and evidence without an early vertical proof of the user's job.
- Supervisors can optimize dependency-safe throughput while the approved demo remains unchanged.
- Closeout can prove conformance to a self-authored spec without a human judging the running product.

The cost or quantity of process is not the primary failure. The failure is that process correctness can crowd out felt user value without triggering a stop.

## User Value Contract

### Named User and Job

Bart, acting as a Delano project owner and supervisor, needs to approve, supervise, and close meaningful delivery without discovering after hours of correct implementation that the named end user still cannot do the intended job.

### Observable Capability

When this project is complete, Bart can open a meaningful Delano project and see the intended job, representative demo, current working demo steps, honest infrastructure boundary, unresolved product findings, and current continue/reshape/stop decision. Delano prevents activation, further execution, or closeout when the applicable gate is unresolved or failed.

### Representative End-to-End Demo

- DEMO-001: Create the sanitized Kotlin foundation regression as a new Mode 4 product project; attempt activation and see Delano reject or require reshaping because supervising an agent is absent from the representative demo.
- DEMO-002: Reclassify the same scope honestly as infrastructure; see a plain disclosure of zero new end-user capability, the first felt-value boundary, and an explicit owner decision before activation can proceed.
- DEMO-003: Plan a corrected product scope; see a thin real-data supervision path scheduled before broad foundation expansion and every enablement task traced to a demo step or bounded infrastructure rationale.
- DEMO-004: Simulate completed foundation work with no newly working demo step; run the re-boil checkpoint and see a reshape/stop gate that blocks unrelated task starts until a human resolves it.
- DEMO-005: Attempt closeout with passing automated tests and screenshots of the read-only Kotlin shell; run the demo on representative server data and see closeout fail on missing transcript/creation/response capability and critical product-quality findings.
- DEMO-006: Run a valid infrastructure project, a Mode 0 patch, a Mode 1 scoped change, and a legacy completed project; see the intended light or compatible behavior without false product claims.

### Explicit Non-Capabilities

- Delano will not decide whether a product is valuable without human judgment.
- Delano will not authenticate that a display name belongs to a human; approval provenance must be described honestly until a stronger identity boundary is chosen.
- This project will not repair or continue the Kotlin Android application.
- It will not prescribe one visual style, ban foundational work, or require every project to ship a GUI.
- It will not make screenshots, word bans, line counts, task counts, or file counts proxies for user value.

### Delivery Classification and First Felt-Value Boundary

This project is `mixed` with a `mixed` human-facing surface profile: it changes contract/runtime policy and also changes operator-facing CLI, status, and Viewer supervision behavior. Its first felt-value boundary is DEMO-001, where a project that currently validates would be stopped before activation with a concrete explanation of the missing user job.

## Product-Surface Obligations

Every meaningful project declares a human-facing surface profile such as `none`, `ui`, `cli`, `api`, `workflow`, or `mixed`. The classification and surface profile must agree with the proposed touchpoints and upstream request/roadmap intent; `none` is not a bypass for a scope that visibly creates or changes a human interface.

For a product or mixed scope, the value contract must identify at least one job-critical end-to-end loop: the smallest sequence in which the named user perceives relevant state, takes the action required by the job, and sees a useful result. Navigation, rendering, or a supporting setup step cannot be relabeled as the job when the approved outcome requires observation, decision, or action. An essential capability from the upstream request or stated job may move to explicit non-capabilities only through an owner-approved outcome change or honest infrastructure reclassification, never through quieter wording.

The spec and plan must make information hierarchy, product copy, contextual actions, representative data/states, interaction feedback, and empty/loading/error behavior reviewable where they affect that loop. The first working vertical proof receives human product-shape review before broad invisible expansion, and the completed outcome receives the full closeout review. This does not prescribe a visual style; it prevents a functional shell from escaping product judgment until the end.

## Outcome and Success Metrics

- SM-001: Every newly created Mode 2 through 4 project is unable to activate without a complete value contract, delivery classification, human-facing surface profile, applicable review, and literal representative demo consistent with upstream intent; genuinely bounded Mode 0 and 1 creation stays no heavier than today, and mode laundering is rejected.
- SM-002: Honest `product`, `infrastructure`, and `mixed` classifications all have valid paths, but infrastructure cannot claim an end-user capability and must name the first felt-value boundary plus owner acceptance.
- SM-003: A product or mixed plan cannot advance into broad invisible work until its declared early vertical proof completes a job-critical end-to-end loop on representative data and passes a human product-shape review, or an owner explicitly reshapes the project.
- SM-004: At each declared value-risk boundary, a re-boil records which expected job-critical and supporting demo steps now work. Failure of the boundary's expected critical step after material enablement yields `reshape-required` or `stop`, and unrelated task starts fail until resolution.
- SM-005: Product closeout fails when the intended job cannot be completed on representative real data or a human review has an unresolved critical finding in information architecture, copy, contextual actions, data usefulness, or interaction quality, regardless of automated evidence.
- SM-006: The Kotlin regression and cosmetic/schema-gaming variants produce zero false passes at activation, re-boil, and closeout; valid infrastructure, small-mode, and legacy fixtures produce zero false blocks in the approved compatibility matrix.
- SM-007: All new rules, skills, templates, schemas, lifecycle behavior, supervision projections, fixtures, docs, mirrors, and package assets agree and pass release validation.

## User Stories

- US-001: As a project owner, I want the named user, intended job, observable capability, non-capabilities, and literal demo confronted before activation so that I do not fund a technically correct but useless scope.
- US-002: As an infrastructure owner, I want invisible work represented honestly with its first felt-value boundary so that legitimate foundations remain possible without pretending they are product payoff.
- US-003: As an executor, I want an early vertical proof and explicit value trace so that architecture and testing serve a demonstrated user outcome.
- US-004: As a supervisor or coding agent, I want authority and an obligation to stop on value drift so that dependency-safe progress cannot conceal a failing outcome.
- US-005: As a product reviewer, I want a real-data demo plus human quality judgment so that accessibility, performance, integration, and screenshots complement rather than replace usefulness and taste.
- US-006: As a maintainer, I want mode-scaled adoption and explicit migration behavior so that small changes and historical contracts remain proportionate and compatible.

## Acceptance Scenarios

- AC-001: Given a new Mode 2 through 4 project lacks any named user, job, observable capability, explicit non-capability, delivery classification, human-facing surface profile, representative demo, or required approval, or those claims contradict upstream intent/touchpoints, when activation is attempted, then it fails with the missing or conflicting decision and no lifecycle mutation.
- AC-002: Given a project is honestly infrastructure-only, when activation is attempted, then Delano states that no new end-user capability is delivered, names the first felt-value boundary, requires owner acceptance, and never reports the infrastructure project itself as product success.
- AC-003: Given a product or mixed plan, when breakdown is reviewed, then a representative vertical proof completes a job-critical state-action-result loop and receives human product-shape review before broad foundation expansion; every task maps to demo steps or an explicit bounded enablement/adoption role.
- AC-004: Given an enablement or supporting task is complete, when progress is reported, then only a demo step executed on its declared representative environment counts as working progress, and a supporting step cannot satisfy a checkpoint that expects a job-critical step; tests, schemas, cosmetics, or screenshots alone do not.
- AC-005: Given a declared value-risk boundary is reached, when re-boil runs, then it compares working demo steps with the prior checkpoint and records `continue`, `reshape-required`, or `stop` with the observed product evidence.
- AC-006: Given approved scope cannot complete the intended job, or material enablement advances without a new working demo step, when any executor or supervisor detects it, then they stop, surface the mismatch, and unrelated task/workstream starts remain blocked until an owner resolves the gate.
- AC-007: Given a product or mixed outcome reaches closeout, when the representative demo is run, then each step is exercised on representative real data and a named human records pass/fail judgment for information architecture, copy, contextual actions, data usefulness, interaction quality, and the intended job.
- AC-008: Given automated accessibility, performance, integration, screenshot, or test evidence passes while the demo or human product review fails, when closure is attempted, then closure fails and the automated evidence is retained only as supporting proof.
- AC-009: Given the failed Kotlin foundation fixture, including a variant with polished copy and complete schema fields, when activation, re-boil, and closeout are evaluated, then it is reshaped or disclosed as infrastructure before execution, stopped when the demo stays unchanged, and rejected at product closeout because agent supervision is impossible.
- AC-010: Given a genuinely bounded Mode 0 patch or Mode 1 scoped change, when normal lifecycle commands run, then no new standalone product-value artifact or mandatory product review is introduced unless local risk policy already requires a GUI check; given a new multi-step capability, coordinated task set, material uncertainty, or cross-surface change is labeled Mode 0/1, validation/readiness requires escalation to Mode 2+.
- AC-011: Given historical complete/deferred projects and existing active/planned Mode 2 through 4 projects, when the runtime is upgraded, then terminal history validates unchanged, planned projects must migrate before activation, and active projects receive a documented next-gate migration path without silent closure.
- AC-012: Given adversarial fixtures that fill every required field, attach screenshots, rename machine work as user value, or self-assert progress, when deterministic and agent-behavior evaluations run, then the system still requires an executable job/demo and produces no false success.

## Scope

### Required Product-Surface Behavior

- Mode-scaled user-value contract and delivery classification in canonical project artifacts.
- Activation checks tied to current contract content and an explicit owner/reviewer decision.
- A short, confrontational `boil-it-down` skill that reshapes canonical scope instead of producing another report.
- Early vertical proof, stable demo-step traceability, and proportionality rules for invisible work.
- Re-boil checkpoints, stop-loss decisions, lifecycle blocking, and visible supervision state.
- Representative real-data demo and human product/taste review before product closeout.
- Kotlin regression, adversarial gaming cases, valid infrastructure cases, small-mode cases, and behavioral agent evaluations.
- Migration, compatibility, documentation, generated mirrors/assets, package assertions, and release evidence.

### Optional Ceremony-Reduction Improvements

- Consolidating progress updates, shortening generated prose, or improving update naming.
- Viewer conveniences beyond the minimum gate/progress/decision supervision surface.
- Advisory lint for vague language or disproportionate plans.

These options may be implemented only if they remain small and demonstrably support the required behavior. They are not substitutes for it.

### Out of Scope

- Arbitrary word bans, line limits, task/file-count limits, or automatic deletion of project history.
- Screenshots as sufficient product acceptance.
- A universal numeric UX score or LLM judgment as the sole hard gate.
- Prohibiting foundation, security, persistence, transport, performance, or reliability work.
- Changes to Kotlin application code or its frozen worktree.
- Remote tracker writes, public approvals, production deployment, or unrelated Delano cleanup.
- Cryptographic human identity or a new organization-wide authorization system.

## Functional Requirements

- FR-001: New Mode 2 through 4 specs declare a versioned value contract, `product | infrastructure | mixed` delivery classification, and `none | ui | cli | api | workflow | mixed` human-facing surface profile; the required body captures the upstream intent, named user/job, observable capability, explicit non-capabilities, demo steps, and first felt-value boundary.
- FR-002: Project activation validates the current value contract, probe state, classification rules, and a content-bound owner/reviewer decision before changing lifecycle state.
- FR-003: `boil-it-down` is a concise skill used before activation, at value-risk boundaries, and before closeout. It must challenge or edit the spec/plan, remove or reshape unjustified scope, and stop when the job/demo is not credible; it must not resolve failure by creating more documentation.
- FR-004: For every non-`none` surface, product and mixed specs/plans define the appropriate human-facing quality dimensions. UI/workflow/mixed surfaces explicitly cover information hierarchy, copy, contextual actions, representative data/states, interaction feedback, and empty/loading/error behavior; they schedule a human-reviewed job-critical vertical proof before broad foundations, declare value-risk boundaries, and explain why each invisible slice is proportionate.
- FR-005: Demo steps distinguish `job-critical` from `supporting`. Tasks use stable demo-step traceability and a bounded value role such as `vertical-proof`, `enablement`, `product-quality`, or `adoption`; enablement completion alone never increments working demo progress or satisfies an expected critical step.
- FR-006: Re-boil compares executable representative demo steps with the prior checkpoint and the boundary's expected critical steps, then records evidence plus `continue | reshape-required | stop`; lifecycle commands reject unrelated starts while the latest decision is unresolved or failed.
- FR-007: AGENTS, execution, planning, quality, and closeout guidance gives every executor and supervisor explicit authority and obligation to stop immediately when approved scope cannot deliver the intended job, even before a scheduled checkpoint.
- FR-008: Status, next-work, and the minimum Viewer supervision surface expose delivery classification, demo progress, latest value decision, blockers, and required human action without presenting task completion as user-value progress.
- FR-009: Product closeout requires a literal demo on representative real data and a human review of intended-job completion, information architecture, copy, contextual actions, data usefulness, and interaction quality. Unresolved critical findings block closure.
- FR-010: Infrastructure closeout verifies the promised technical capability and restates the first felt-value boundary; it never fabricates a product review or product-success claim.
- FR-011: The regression suite includes the failed Kotlin foundation case, a cosmetically improved but still useless variant, a schema-complete gaming variant, an honest infrastructure case, a valid product vertical slice, small modes, and legacy projects.
- FR-012: Deterministic checks verify structure and lifecycle; behavioral agent evaluations verify stop/reshape/close decisions; human review verifies product judgment. Release requires all three applicable evidence classes.
- FR-013: Adoption is versioned and non-destructive: new project scaffolds opt in by default, planned legacy projects migrate before activation, active projects migrate at the next value boundary, terminal history remains readable, and modes 0 and 1 remain light only for bounded work. Mode selection/readiness rejects new multi-step capability, coordinated task sets, material uncertainty, or cross-surface work disguised as a patch/scoped change.
- FR-014: Canonical `.agents/`, templates, schemas, CLI/runtime, tests, docs, Viewer source, generated `.claude/` mirror, install manifest, payload, and npm package stay synchronized.

## Non-Functional Requirements

- NFR-001: The system fails closed on missing or stale value-gate state without mutating lifecycle or unrelated contracts.
- NFR-002: Deterministic validation remains local, repository-relative, privacy-safe, and linear in project artifact count.
- NFR-003: A language model or keyword list may advise but cannot be the only enforcement of product value.
- NFR-004: Human judgment records concise findings and evidence, not a long narrative or universal taste score.
- NFR-005: The mechanism adds less recurring effort than the failure it prevents; modes 0 and 1 gain no mandatory artifact family.
- NFR-006: Existing invisible engineering evidence remains valid and visible even when a product gate stops further scope.

## Assumptions

- An eager but compliant agent will preserve explicit upstream intent and honor a prohibition on self-approving a human gate; a malicious agent with full repository write access cannot be made cryptographically honest by Markdown alone.
- Representative data can be local, staged, or production-derived, but it must exercise the realistic data shape and failure modes named in the demo.
- A project may be valuable infrastructure even when it has no immediate product surface, provided that fact is explicit and approved.
- Existing task dependency and scoped lifecycle machinery can host additional preconditions without a new top-level status model.

## Needs Clarification

- NC-001: Approval provenance. Recommendation: a named owner or delegated human review bound to the current spec/demo content hash; state plainly that this is accountable provenance, not authenticated identity.
- NC-002: Checkpoint cadence. Recommendation: every declared value-risk boundary and workstream handoff, plus immediate event-driven stop on scope mismatch; do not use a fixed task count or elapsed-time quota.
- NC-003: Infrastructure without an approved downstream project. Recommendation: allow activation only after explicit owner acceptance that the first felt-value boundary is named but not yet scheduled; do not call the project product success.
- NC-004: Reviewer independence. Recommendation: the owner or a delegated human may perform product review, but the implementing agent may not self-approve; high-risk projects should name a non-implementing reviewer when available.

## Hypotheses and Unknowns

- H-001: A literal demo and explicit non-capabilities will expose a value gap earlier than broader outcome prose.
- H-002: Value-risk boundaries tied to the plan will create a better stop-loss than arbitrary task counts.
- H-003: A layered gate will resist eager-agent compliance gaming better than a new standalone payoff document.
- U-001: The smallest durable review/checkpoint record and content-hash binding need a prototype before schema commitment.
- U-002: Behavioral eval fixtures must distinguish a compliant stop from verbose concern followed by continued execution.
- U-003: The minimum useful Viewer projection must be confirmed without turning this into a dashboard redesign.

### Required Prototype Probe

Before activation, run a probe of no more than one day against sanitized Kotlin, honest-infrastructure, valid-product, small-mode, and legacy cases. Use candidate contract text, lifecycle preconditions, and agent prompts without merging production runtime code. Approval requires the Kotlin case to stop or reshape at all three gates, the valid cases to proceed correctly, and the result to identify a small machine-readable record that does not become a parallel source of truth.

## Touchpoints to Exercise

- `HANDBOOK.md`, `AGENTS.md`, delivery-mode/status rules, and the core lifecycle skills.
- `.project/templates/{spec,plan,workstream,task,completion-summary}.md` and relevant artifact schemas.
- `src/cli/commands/state.js`, project-state helpers, `pm/validate.sh`, status/next scripts, and lifecycle checkers.
- Viewer index/domain/supervision surfaces needed to show value-gate state.
- Skill-output and strict validation fixtures, new behavioral evaluation fixtures, CLI/package/viewer tests, generated mirrors, and package payload.

## Probe Findings

No prototype has run. Research inspection established the current lifecycle, validation, review, evidence, closeout, Viewer, packaging, and fixture seams and showed why structural checks alone are insufficient. The project must remain planned until the required behavior probe and NC-001 through NC-004 decisions are resolved.

## Footguns Discovered

- Current operating-mode validation proves headings exist, not that a user can complete a job.
- Current done-task evidence accepts checked criteria and proof-like text; an eager agent can satisfy that while the product remains useless.
- Native task rollups can close parent project state when all tasks close, so product closeout must become a real lifecycle precondition rather than guidance after the fact.
- A `product | infrastructure` flag becomes an escape hatch unless both branches have explicit, reviewed obligations.
- Screenshot-only evidence can prove that the wrong interface rendered correctly.
- A re-boil can become status theater unless only newly executable demo steps count and no-progress decisions block work.
- Published review provenance binds to a source document, not a running build or authenticated human identity.
- Adding `payoff.md`, language bans, or update-count caps would be easy to validate and easy to game.
- Mode 0/1 can become a bypass if the runtime never challenges a large or sliced product scope mislabeled as bounded work.

## Remaining Unknowns

NC-001 through NC-004 and U-001 through U-003 remain open. The prototype may revise storage and command shape, but it may not weaken the activation, stop-loss, real-data demo, or human product-review outcomes.

## Dependencies

- Existing operating-mode, status-transition, evidence, review, project-template, and lifecycle command contracts.
- Existing execution, quality, closeout, and learning skills.
- Viewer project/status projections and guarded local review behavior.
- Generated compatibility mirror and npm payload workflow.
- Bart's decisions on approval provenance, checkpoint cadence, infrastructure acceptance, and reviewer independence.

## Approval Notes

- 2026-08-08: Bart requested this project outline and authorized committing/pushing planned contracts only. No runtime implementation, prototype result, activation, task readiness, or external tracker mutation is authorized by that request.
