---
name: Delano Spec Kit Interop and Authoring Layer
slug: 012-delano-spec-kit-interop
owner: delano-team
status: complete
created: 2026-05-10T09:02:02Z
updated: 2026-05-12T10:34:21Z
outcome: Delano can accept Spec Kit-style intent artifacts and guide new users from idea to governed delivery without weakening evidence, validation, sync, multi-agent, or closeout contracts.
uncertainty: medium
probe_required: true
probe_status: pending
---

# Spec: Delano Spec Kit Interop and Authoring Layer

## Executive Summary

Delano should complement GitHub Spec Kit instead of competing with it directly. Spec Kit is strongest at turning an idea into intent artifacts: spec, clarification, plan, tasks, and implementation prompts. Delano is strongest at governing delivery: local contracts, validation, evidence, Linear/GitHub sync, multi-agent coordination, and closeout learning.

This project turns the integration plan in `docs/plans/spec-kit-integration-plan.md` into executable Delano work. The combined model is:

> Spec Kit generates intent and implementation structure. Delano governs delivery execution and proof.

## Problem and Users

Users who like spec-driven AI development need an easier path into Delano. Today Delano's operational model is strong, but the first steps are more delivery-contract oriented than authoring oriented. Spec Kit demonstrates a simpler public workflow: start with an idea, clarify it, generate a plan, break it into tasks, and implement.

Primary users:

- Solo builders and technical founders adopting spec-driven AI delivery.
- Product/engineering teams that want generated specs but still need auditable execution.
- Agents that need predictable commands for discovery, planning, task creation, implementation, and validation.
- Operators who want Delano's governance model without learning the full handbook before the first successful run.

## Outcome and Success Metrics

Success means Delano has a concrete, validated path from Spec Kit-style intent to Delano-governed delivery.

Measurable targets:

- A user can create or import a Spec Kit-style spec and convert it into a valid `.project/projects/<slug>/` Delano project.
- The authoring flow produces or updates `spec.md`, `plan.md`, workstreams, and tasks without bypassing Delano validation.
- At least one public first-15-minutes guide demonstrates the full path from idea to validated project.
- Research/intake artifacts can be created in a repo-native way before delivery planning.
- Preset or adapter structure is documented enough for a second agent/tool integration to be added without redesign.
- `delano validate` remains green after generated/imported artifacts are created.

## Scope

### In Scope

- Spec Kit-style authoring commands or documented command design for discovery, clarification, research, planning, tasks, and implementation.
- Import/conversion semantics from Spec Kit artifacts into Delano `.project` contracts.
- Template improvements for user stories, acceptance scenarios, assumptions, success criteria, clarification markers, story traceability, and parallel task hints.
- A repo-native research/intake workflow inspired by `planning_with_files`.
- Preset and adapter architecture for agent integrations and workflow packs.
- Onboarding and public documentation improvements.
- Validation gates that preserve Delano's proof-oriented runtime.

### Out of Scope

- Replacing Spec Kit.
- Depending on Bart's private Obsidian vault, OpenClaw runtime, or local skill directory.
- Removing or weakening `HANDBOOK.md`, `.project`, validation, evidence, sync, or closeout contracts.
- Automatically writing to Linear/GitHub without dry-run and operator approval semantics.
- Full implementation of every command in one release if probes reveal a smaller first slice is safer.

## Functional Requirements

- Provide an authoring flow that starts from a plain idea and results in valid Delano project artifacts.
- Support Spec Kit-style artifact import or translation without making Spec Kit mandatory.
- Preserve `.project` as the local source of truth for execution state.
- Add research/intake artifacts that can be summarized into `spec.md` and `plan.md`.
- Capture user stories and acceptance scenarios in specs or task traceability.
- Convert parallelizable task hints into Delano `parallel: true` plus conflict/dependency fields.
- Define adapter/preset metadata so agent integrations can be discovered and validated.
- Keep generated artifacts portable and free of private local path references.

## Non-Functional Requirements

- All generated project artifacts must pass Delano validation.
- The workflow must work offline after install, except for optional external integrations.
- Importers and generators must be conservative by default and show diffs before overwriting repo-owned state.
- Public docs must explain the model simply without requiring readers to understand the full handbook first.
- The implementation must be testable with fixtures, not only by manual agent runs.

## Hypotheses and Unknowns

- Hypothesis: Delano can capture most Spec Kit authoring value through templates, wrappers, importers, and docs before adding a large new runtime.
- Hypothesis: A repo-native research folder is enough for public Delano, while Obsidian/OpenClaw bridges can remain optional adapters.
- Unknown: Whether `delano discover/clarify/plan/tasks` should be first-class CLI commands or documented agent skill commands first.
- Unknown: How much of Spec Kit artifact structure should be imported directly versus normalized into Delano fields.
- Unknown: Whether presets belong under install categories, `.agents/adapters`, `.project/templates`, or a new manifest location.

## Touchpoints to Exercise

- `src/cli/index.js` and command dispatch.
- `.agents/scripts/pm/init.sh`, `validate.sh`, `status.sh`, and `next.sh`.
- `.project/templates/spec.md`, `plan.md`, `task.md`, and `workstream.md`.
- `.agents/skills/` planning, discovery, breakdown, sync, execution, quality, closeout, and learning flows.
- Documentation in `README.md`, `docs/user-guide.md`, and `HANDBOOK.md`.
- Existing install preset/category semantics.
- Viewer rendering of created artifacts.

## Probe Findings

Pending. Probe work should answer:

- Which smallest command or script slice proves the authoring layer without overbuilding?
- Can a Spec Kit-style fixture be converted into valid Delano project artifacts?
- Does a repo-native research folder improve planning quality without creating duplicate truth?
- Can presets/adapters be represented with a small manifest and validation fixture?

## Footguns Discovered

- Making Delano depend on private local tools would damage portability.
- Treating generated Spec Kit tasks as executable without Delano dependencies/evidence would weaken the core contract.
- Adding too many CLI commands before proving templates/import semantics could create surface area without reliability.
- Presets that overwrite repo-owned `.project` state could violate Delano's conservative install model.

## Remaining Unknowns

- Exact CLI names and flags after the first probe.
- Whether import should support live Spec Kit folders, pasted markdown, or both.
- Whether research artifacts live under `.project/research/`, project-local `research/`, or `updates/` until finalized.
- How adapter metadata should map to packaged assets and install categories.

## Dependencies

- Existing Delano validation runtime.
- Existing `.project` contract schemas and templates.
- Integration plan: `docs/plans/spec-kit-integration-plan.md`.
- Existing Spec Kit comparison note summarized into the plan.

## Approval Notes

Bart requested conversion of the integration plan into Delano project artifacts and asked for commit and push to `main` after completion.
