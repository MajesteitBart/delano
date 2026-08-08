---
name: Delano User Value and Product Quality Gates
status: planned
lead: bart
created: 2026-08-08T20:16:34Z
updated: 2026-08-08T20:30:33Z
linear_project_id:
risk_level: high
spec_status_at_plan_time: planned
operating_mode: multi-stream
---

# Delivery Plan: Delano User Value and Product Quality Gates

## What Changed After Probe

The required prototype probe has not run, so this is a provisional delivery plan and every task remains `planned`. Research retained the strongest parts of the proposed `boil-it-down` concept: named user capability, a literal demo, the smallest version, honest infrastructure disclosure, a mid-project re-boil, and a real product/taste gate. It rejected the proposed 30-line limit, banned-word list, screenshot sufficiency, and one-update-file rule because those optimize compliance with a new artifact rather than product judgment.

The plan will be revised after the probe if the candidate record, lifecycle hook, or evaluation shape fails the Kotlin and valid-control cases. The non-negotiable outcomes are activation truth, early vertical proof, stop-loss supervision, and human product closeout.

## Technical Context

- Modes 2 through 4 currently enforce artifact presence and section headings through `operating-modes.json` and `check-operating-modes.mjs`; modes 0 and 1 keep lean surfaces.
- `pm/validate.sh` checks core frontmatter, dependencies, evidence, and many specialized validators. It does not evaluate whether outcome prose or acceptance evidence describes a useful human capability.
- Native project/task/workstream commands patch contracts and apply scoped rollups. Closing the final task can close parent lifecycle, so new product closeout preconditions must be enforced inside the mutation path as well as validation.
- Tasks already carry story/acceptance traceability. Extending that contract with stable demo-step IDs and a bounded value role avoids a second task graph.
- Updates already hold project evidence. A concise typed update or pointer from the plan can hold activation/checkpoint/product-review receipts without introducing a standalone `payoff.md` source of truth.
- Published Viewer reviews bind to Markdown content hashes but do not authenticate human identity or bind findings to a running product build.
- The current skill-output evaluation only verifies non-empty evidence and metadata-only privacy. The new regression needs behavioral decisions, control cases, and explicit false-pass/false-block outcomes.
- Viewer status is a projection of `.project`; the minimum required UI change is supervision visibility, not a broad dashboard redesign.

## Architecture Decisions

### AD-001: Use a three-layer defense

Deterministic contract and lifecycle checks enforce missing/stale gate state; lifecycle skills enforce confrontational reasoning and stop behavior; behavioral fixtures plus human review evaluate the job and product. No layer is treated as sufficient alone.

### AD-002: Put value truth in existing canonical artifacts

The spec owns the user, job, capability, non-capabilities, classification, and demo. The plan owns vertical proof, proportionality, and value-risk boundaries. Tasks own demo-step traceability and value roles. Existing updates carry concise hash-bound decisions/evidence. Do not require `payoff.md` or a second project plan.

### AD-003: Make both product and infrastructure explicit

Use a versioned `product | infrastructure | mixed` classification plus a `none | ui | cli | api | workflow | mixed` human-facing surface profile. Both must agree with upstream intent and touched surfaces. Product and mixed scopes owe an end-to-end demo and applicable product review. Infrastructure owes a plain zero-new-user-capability disclosure, first felt-value boundary, technical proof, and explicit owner acceptance. Classification or `surface: none` cannot waive review silently.

### AD-004: Trace working capability, not completed machinery

Stable `DEMO-###` steps are tagged `job-critical` or `supporting`. Every product/mixed project defines a smallest state-action-result loop, and the vertical proof must complete it on representative data and receive human product-shape review. Tasks declare `vertical-proof`, `enablement`, `product-quality`, or `adoption` roles and map to demo steps. Only a step executed in its representative environment changes demo progress; a supporting step cannot satisfy a boundary expecting a critical step, and task completion, tests, screenshots, cosmetics, and evidence volume do not.

### AD-005: Make value decisions lifecycle preconditions

Project start requires a current value contract and approval. Workstream/value-risk boundaries require `continue | reshape-required | stop`. Task/workstream start rejects stale or failed gates. Product project close requires a passing current demo/product review before parent rollup can complete.

### AD-006: Human review is qualitative and accountable

The product review records the intended job plus critical findings across information architecture, copy, contextual actions, data usefulness, and interaction quality. It is bound to the demo/build/data evidence and names the responsible human reviewer. It does not claim cryptographic identity and cannot be self-approved by the implementing agent.

### AD-007: The Kotlin case is a behavioral regression, not an illustration

The fixture must fail at activation, re-boil, and closeout even when cosmetic defects are fixed, screenshots are attached, or every schema field is populated. Honest infrastructure, useful vertical product, small-mode, and legacy controls must pass their intended paths.

### AD-008: Adopt additively and migrate at meaningful boundaries

New Mode 2 through 4 scaffolds declare the versioned contract. Planned legacy projects migrate before activation. Active legacy projects do not fail normal validation immediately but must re-boil before the next declared boundary and cannot silently close. Terminal history remains unchanged. Modes 0 and 1 gain no mandatory artifact family.

## Policy and Contract Checks

- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval
- [x] Human review is not represented as machine-authenticated identity
- [x] Optional ceremony reduction is separated from required product behavior

## Generated Artifact Map

- `spec.md`: Created through `delano project create`, then rewritten from direct source inspection under discovery/research.
- `plan.md`: Provisional plan derived from the planned spec under planning-skill; activation awaits the probe and owner decisions.
- `decisions.md`: Records accepted design boundaries and unresolved owner decisions.
- `research/product-value-gate-design/`: Summarizes the T3 regression, Delano runtime/precedent, and public skill inspiration without copying raw session logs.
- `workstreams/`: Four bounded implementation streams created through `delano workstream add`.
- `tasks/`: Twelve atomic planned tasks created through `delano task add`; none is execution-ready.

## Complexity Exceptions

- Activation, execution, and closeout checks cross schemas, skills, CLI mutation, validators, projections, tests, generated mirrors, and package assets. A shared value-gate domain model is warranted so those consumers do not invent conflicting semantics.
- Behavioral agent evaluation cannot be reduced to the existing deterministic fixture checker. It is retained as a distinct release evidence class with deterministic fixture/schema validation around it.
- A minimum Viewer projection is required because a supervision gate that exists only in hidden frontmatter would repeat the visibility failure this project is meant to fix.

## Probe-Driven Architecture Changes

Pending. The probe must choose the smallest durable representation for activation/checkpoint/product-review decisions, demonstrate content freshness, and test whether the skill plus lifecycle checks cause an eager executor to stop. It may change field and command names, but not weaken the agreed outcomes.

## Workstream Design

- **WS-A Contract and Activation:** own the value contract, classification, `boil-it-down`, approval semantics, operating-mode rules, activation enforcement, and legacy migration entry point.
- **WS-B Value-First Execution and Supervision:** own vertical-proof planning, demo/task traceability, foundation proportionality, re-boil/stop-loss behavior, lifecycle guards, and status/Viewer supervision projections.
- **WS-C Product Review and Closeout:** own representative-data evidence, human product-quality review, quality/closeout skill integration, infrastructure closeout, and closure preconditions.
- **WS-D Regression, Adoption, and Release:** own the Kotlin and control fixtures, adversarial behavior evaluations, migration/compatibility matrix, canonical documentation, generated/package parity, and end-to-end release evidence.

WS-A stabilizes the activation contract. WS-B can define planning traceability after T-001 while WS-A completes the activation path. WS-C can define the review evidence after T-004. Lifecycle enforcement converges before the regression/adoption stream. Generated assets and final validation wait for all source semantics.

## Milestone Strategy

1. **M0, behavior probe:** demonstrate that candidate gates reject the Kotlin regression and accept valid controls; revise or approve the planned spec.
2. **M1, activation truth:** versioned value contract, honest classifications, `boil-it-down`, current approval, activation enforcement, and migration path agree.
3. **M2, value-first execution:** vertical proof, value trace, re-boil, stop-loss, task/workstream guards, and supervision visibility work end to end.
4. **M3, product closeout:** representative real-data demo, human product review, infrastructure semantics, and rollup/closure guards agree.
5. **M4, adversarial readiness:** Kotlin/gaming/control fixtures, supported behavioral evals, migration matrix, docs, generated state, package tests, and release checks pass.

## Rollout Strategy

- Introduce an explicit value-contract version rather than date-based strictness.
- Make new Mode 2 through 4 project scaffolds emit the new sections and pending gate state. Keep them planned until review.
- Keep Mode 0/1 artifact surfaces unchanged for genuinely bounded work. Add a mode-selection/readiness escalation guard for new multi-step capabilities, coordinated task sets, material uncertainty, cross-surface work, and related work sliced into nominally small tasks; existing local GUI risk policy still applies when a bounded task changes a product surface.
- Provide an idempotent, previewable migration for existing planned/active projects. Never invent the user job, demo, classification, approval, or product findings during migration.
- Preserve terminal historical contracts without warnings that demand retroactive product evidence.
- Show active legacy projects as migration-required at the next value boundary; do not auto-stop them merely on install, and do not permit silent closeout.
- Ship contract/CLI enforcement before relying on Viewer affordances. Viewer remains a projection of canonical files.

## Test Strategy

### Deterministic contract and lifecycle checks

- Validate required fields/sections, classification branches, stable demo IDs, traceability, content freshness, dependency order, gate decisions, and lifecycle failure-without-write.
- Verify parent rollups cannot close a product project around a missing/failed product review.
- Test new, migrated, stale, conflicting, malformed, and non-adopting contracts on Windows-compatible paths.

### Judgment and behavior checks

- Run activation, supervision, and closeout prompts against the Kotlin regression and schema/cosmetic/screenshot gaming variants. A passing response must stop or reshape and must not continue implementation after expressing concern.
- Run honest infrastructure, useful vertical product, small-mode, and legacy controls to detect overblocking.
- Require a human-reviewed decision matrix with zero false passes on the three Kotlin gates and zero false blocks in the approved controls before release.

### Product evidence checks

- Exercise the Delano representative demo using actual lifecycle commands and representative project data.
- Have a named human review information architecture, copy, contextual actions, data usefulness, interaction quality, and job completion in the minimum Viewer/CLI supervision surface.
- Treat accessibility, performance, integration, automated tests, screenshots, and recordings as complementary evidence.

### Release checks

- Run focused CLI/schema/status/evidence/skill-eval/viewer tests, Viewer typecheck/lint/build if changed, root `npm test`, mirror parity, payload/manifest drift, release validation, package dry-run, and privacy/log safety.

## Rollback Strategy

- Stop emitting the new contract version for newly created projects and remove new mutation preconditions only through a reviewed runtime rollback.
- Preserve value-contract sections, decisions, checkpoint/product-review updates, and migration evidence as readable unknown fields/artifacts; do not delete user-authored evidence.
- Rebuild generated `.claude/`, Viewer public assets, and package payload from canonical sources rather than editing generated files.
- Restore legacy lifecycle behavior only with an explicit warning that product-value gates are unavailable; do not reinterpret stopped/failed projects as successful.

## Remaining Delivery Risks

- A compliant agent can still write plausible but false prose; executable demo evidence and non-self-approved review are essential.
- The repository cannot authenticate humanness without a new trust boundary. The implementation must be honest about accountable provenance versus identity proof.
- Overly strict infrastructure rules could block valuable enabling work; overly loose rules recreate the Kotlin escape hatch.
- Re-boil checkpoints can become routine status updates unless no-progress decisions actually block unrelated starts.
- Parent lifecycle rollups and direct Markdown edits offer multiple mutation paths that must agree on failure behavior.
- Behavioral model evaluations can vary by model/version and need versioned fixtures plus human review rather than one brittle output string.
- Viewer scope can expand quickly; only the supervision state required by DEMO-001 through DEMO-006 belongs here.
- NC-001 through NC-004 remain owner decisions, and the required prototype remains pending. No task may be promoted to `ready` before those gates are resolved.
