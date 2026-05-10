---
name: Delano Spec Kit Interop and Authoring Layer
status: planned
lead: bart
created: 2026-05-10T09:02:02Z
updated: 2026-05-10T09:02:02Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: planned
---

# Delivery Plan: Delano Spec Kit Interop and Authoring Layer

## What Changed After Probe

No implementation probe has been run yet. This plan begins from the completed comparison and integration plan. The first delivery milestone is intentionally probe-heavy so Delano can validate the smallest useful authoring/import path before expanding the CLI surface.

## Architecture Decisions

- Keep Delano as the delivery runtime and `.project` as the source of truth.
- Treat Spec Kit-style artifacts as upstream intent inputs, not execution state.
- Add authoring/import capabilities as a layer before current operational commands.
- Make the `planning_with_files` pattern portable by implementing repo-native research artifacts instead of depending on Obsidian/OpenClaw.
- Use manifests, fixtures, and validation for presets/adapters instead of implicit conventions.
- Preserve conservative install/update behavior for repo-owned state.

## Probe-Driven Architecture Changes

Planned probes:

1. Convert a Spec Kit-style markdown fixture into a valid Delano project.
2. Create a repo-native research/intake folder and fold it into `spec.md`/`plan.md`.
3. Add one thin authoring command or script wrapper and verify it does not bypass validation.
4. Define one preset/adapter manifest and validate it through fixture tests.

Architecture should only expand after these probes prove the shapes.

## Workstream Design

- WS-A: Authoring and import layer.
- WS-B: Contract templates and traceability.
- WS-C: Repo-native research/intake workflow.
- WS-D: Presets, adapters, onboarding, and public simplicity.
- WS-E: Validation, fixtures, and rollout gates.

## Milestone Strategy

1. Milestone 1: Probe and contract design.
2. Milestone 2: Minimal authoring/import implementation.
3. Milestone 3: Research workflow and template upgrades.
4. Milestone 4: Presets/adapters and onboarding docs.
5. Milestone 5: Validation hardening and release closeout.

## Rollout Strategy

- Start as an experimental project in Delano's own `.project` state.
- Keep public docs framed as complementarity with Spec Kit.
- Release the first slice as a conservative workflow with clear validation evidence.
- Promote commands from script/agent workflows to CLI only after fixture-backed behavior is stable.

## Test Strategy

- Add markdown fixtures for Spec Kit-style specs, plans, and task lists.
- Verify importer/generator outputs pass `delano validate`.
- Run `npm test` and `npm run check:text-safety` before handoff.
- Add text-safety checks for generated docs and fixtures.
- Use viewer smoke inspection for created project artifacts where relevant.

## Rollback Strategy

- Keep all changes additive until commands are proven.
- Preserve old templates or provide migration notes if template fields are added.
- Gate install/preset application behind dry-run conflict output.
- If importer behavior is unreliable, ship the research/template/doc workflow first and defer automation.

## Remaining Delivery Risks

- Over-broad command surface could make Delano harder to maintain.
- Importing Spec Kit artifacts too literally could duplicate truth instead of normalizing into Delano contracts.
- Research artifacts could become a second planning system unless they have explicit fold-forward rules.
- Presets/adapters could conflict with Delano's conservative install behavior if not designed carefully.
- Public positioning must stay complementary and avoid implying ownership of Spec Kit concepts.
