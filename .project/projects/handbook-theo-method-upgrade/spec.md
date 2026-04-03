---
name: Handbook Theo-Method Upgrade
slug: handbook-theo-method-upgrade
owner: team
status: approved
created: 2026-04-02T18:02:50Z
updated: 2026-04-02T18:03:17Z
outcome: Delano handbook, scaffolds, validator, and operator docs align on `.project` as canonical truth, `.agents` as canonical runtime, and a probe-aware delivery flow, with validation passing after the upgrade.
uncertainty: medium
probe_required: false
probe_status: skipped
---

# Spec: Handbook Theo-Method Upgrade

## Executive Summary
- Translate the v2.1 handbook diff into a repo-backed upgrade that keeps Delano disciplined while making `.agents` canonical, `.claude` explicitly compatibility-only, and probe-first learning first-class when uncertainty is material.
- Land the change as a coordinated documentation and runtime update so the handbook, templates, scaffolds, and validation rules describe the same operating model.

## Problem and Users
- `HANDBOOK.md` still presents `.claude` as the runtime root and does not model Prototype Probe as a formal stage, while the repo already centers shared runtime assets in `.agents/`.
- Maintainers, PM/tech lead roles, and coding agents rely on these docs and templates to decide what is canonical; drift here creates wrong scaffolds, stale examples, and false validator expectations.
- The primary user pain is silent divergence between written process, generated artifacts, and executable scripts.

## Outcome and Success Metrics
- Handbook sections covering purpose, model, repo structure, contracts, workflow, playbooks, templates, and migration reflect the v2.1 proposal with repo-accurate `.agents` and `.claude` framing.
- `.project/templates/spec.md` and `.project/templates/plan.md` scaffold the probe-aware fields and sections described in the proposal.
- `.agents/scripts/pm/init.sh`, `.agents/scripts/pm/validate.sh`, README/install messaging, and shared runtime docs point to `.agents` as canonical while keeping `.claude` compatibility behavior explicit.
- Repo validation passes once the Windows-compatible validator dependency path is addressed.

## Scope
### In Scope
- `HANDBOOK.md`
- `.project/templates/spec.md`
- `.project/templates/plan.md`
- `.agents/scripts/pm/init.sh`
- `.agents/scripts/pm/validate.sh`
- `README.md`
- `install-delano.sh`
- shared runtime docs and skill/runbook references that still teach `.claude` as the canonical path
- targeted compatibility wording for `.claude` as mirror or symlink
### Out of Scope
- introducing new runtime directories not present in the repo, such as `.agents/prompts/` or `.agents/runtimes/`
- removing `.claude` compatibility outright
- redesigning Delano's task schema beyond the probe-related spec and plan changes in the proposal
- changing Linear or GitHub mappings except where wording must match the clarified sync model
- broad installer feature work unrelated to the handbook and runtime alignment

## Functional Requirements
- Add formal probe-aware flow language: `Spec Draft -> Probe Decision -> Approved Spec`, with Prototype Probe as the explicit uncertainty stage when needed.
- Reframe Delano as runtime-guided and prompt- and skill-driven while preserving `.project` file contracts as canonical truth.
- Update repo structure, boundary policy, and interoperability language to describe `.agents` as canonical shared runtime and `.agents/adapters/<agent>/` as the adapter model.
- Expand spec and plan contract and template content to give uncertainty, probe decisions, touched surfaces, findings, post-probe changes, and remaining risks a canonical home.
- Clarify synchronization as idempotent and event-driven rather than a stop-the-world gate.
- Update PM, tech lead, and engineer playbooks so probe adequacy, skip rationale, and approval timing are explicit responsibilities.
- Keep handbook references aligned with current stage skills: discovery, planning, breakdown, sync, execution, quality, closeout, and learning.
- Pair handbook changes with scaffold, README, installer, and validator updates so written and runnable models stay aligned.

## Non-Functional Requirements
- Maintain backward compatibility for runtimes that still rely on `.claude`.
- Avoid absolute path leakage in `.project` and shared docs.
- Keep the migration non-destructive and documentation-first.
- Preserve agent-agnostic behavior across Codex, Claude Code, OpenCode, and Pi.
- Limit implementation to high-signal changes; do not expand scope into unrelated runtime reorganizations.

## Hypotheses and Unknowns
- The repo can adopt `.agents`-first references broadly without breaking existing `.claude`-based consumers if compatibility language and validator tolerance are updated together.
- The current Windows environment issue in `pm/validate.sh` is an implementation gap in the validator, not a blocker in the handbook/runtime model itself.
- Most stale `.claude` references can be updated mechanically, but a few should remain as compatibility examples rather than be rewritten blindly.

## Touchpoints to Exercise
- `bash .agents/scripts/pm/init.sh` scaffold output after template changes
- `bash .agents/scripts/pm/validate.sh` on a repo with `.agents` canonical and `.claude` compatibility in place
- README/install quick-start paths and final installer guidance
- skill contracts and runbooks that currently hard-code `.claude` execution paths

## Probe Findings
- The repo already matches the proposed adapter model: shared runtime in `.agents`, runtime-specific adapters under `.agents/adapters/<agent>/`, `.claude` present as a compatibility bridge, and templates under `.project/templates/`.
- The existing handbook and several runtime docs and scripts still present `.claude` as canonical or hard-code `.claude` paths.
- `pm/validate.sh` currently requires `python3` for dependency-cycle checking; on this Windows environment that command is missing, which causes validation to fail even when the scaffold is otherwise correct.

## Footguns Discovered
- Editing `HANDBOOK.md` alone would deepen drift because README, installer output, templates, skill docs, and validator logic still teach or enforce the old path model.
- Moving validator expectations to `.agents` without preserving `.claude` tolerance would conflict with the repo's stated compatibility rule.
- Adding handbook references to directories that do not exist in the repo would create fresh contract drift.

## Remaining Unknowns
- Whether validator cycle checking should be rewritten to shell or awk, fall back to `python`, or prefer `py -3` on Windows.
- Whether every skill and runbook should switch to `.agents` examples immediately or some should intentionally show both canonical and compatibility forms.
- How much downstream documentation outside this repo depends on the `.claude` path examples.

## Dependencies
- approval of the v2.1 handbook diff as the target model
- coordinated changes across handbook, templates, runtime scripts, and shared docs
- a Windows-compatible path for the validator's dependency-cycle check
- final reviewer pass on probe policy wording and migration semantics

## Approval Notes
- `probe_required: false` for this upgrade because the supplied diff already captures the investigation and target state; no additional prototype is needed before planning.
- Planning assumes `.project` remains canonical truth and `.claude` remains a compatibility bridge, not a second runtime source of truth.
