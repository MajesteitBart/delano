---
name: Handbook Theo-Method Upgrade
status: done
lead: team
created: 2026-04-02T18:02:50Z
updated: 2026-04-03T06:43:27Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: approved
---

# Delivery Plan: Handbook Theo-Method Upgrade

## What Changed After Probe
- No separate prototype execution is required; the supplied diff already serves as the investigation artifact for this upgrade.
- Planning therefore focuses on implementation bundling: handbook prose, templates and scaffolds, validator behavior, and operator docs must ship together.

## Architecture Decisions
- `.project` remains the single canonical source of delivery truth.
- `.agents` becomes the canonical shared runtime reference in handbook, docs, and scripts.
- `.claude` remains supported as a compatibility mirror or symlink; docs may mention it only as bridge behavior, not canonical structure.
- Probe-aware additions land first in spec and plan contracts; task schema remains unchanged for this upgrade.
- Synchronization wording changes are documentation and policy changes unless a specific script requires follow-up.

## Probe-Driven Architecture Changes
- Treat the user-provided diff as the reality-checked source of gaps between repo state and handbook, so implementation should optimize for consistency across artifacts rather than new exploration.
- Add a validator portability fix to scope because current validation is not portable in this Windows environment.

## Workstream Design
- `WS-A Handbook Model Alignment`: update handbook framing, lifecycle, repo structure, workflow, role playbooks, templates section, and migration guidance.
- `WS-B Probe-Aware Contracts and Operator Docs`: update templates, README, script docs, installer messaging, and shared runtime docs so examples and scaffolds match the new model.
- `WS-C Runtime Compatibility and Validation`: update `pm/init.sh`, `pm/validate.sh`, and shared skill/runbook references to make `.agents` canonical, preserve `.claude` compatibility, and restore validation portability.

## Milestone Strategy
1. Finalize handbook terminology, stage model, and repo-structure language.
2. Land probe-aware templates and init-script output.
3. Update validator behavior, README, installer output, and lingering canonical-path examples.
4. Run full verification on the generated scaffold and remaining canonical-path references.

## Rollout Strategy
- Ship changes in dependency order: handbook and source-of-truth language first, scaffold and template generation second, validator and doc sweep third.
- Keep `.claude` compatibility intact through the full rollout.
- Avoid partial merges where handbook says `.agents` but scaffolds or validators still emit `.claude`-first semantics.
- Backfill active project specs and plans to new frontmatter only when those projects are touched; do not force repo-wide historical rewrites as part of this change.

## Test Strategy
- Run `bash .agents/scripts/pm/validate.sh` after each major bundle once validator portability is fixed.
- Create a throwaway scaffold with `bash .agents/scripts/pm/init.sh <slug> ...` and confirm generated `spec.md` and `plan.md` match the updated templates.
- Search repo docs for stale canonical `.claude` language and ensure remaining `.claude` references are explicitly compatibility-only.
- Review `README.md`, installer final output, and skill/runbook examples for consistent canonical path guidance.

## Rollback Strategy
- Revert handbook, templates, init script, validator, and doc path changes as a single bundle if validation or scaffolding becomes inconsistent.
- If the validator portability fix is unstable, keep handbook and doc edits out of merge until the runnable validation path is restored.
- Preserve `.claude` compatibility behavior throughout rollback; do not strand consumers on a half-migrated path model.

## Remaining Delivery Risks
- External docs outside this repository may still use legacy `.claude` examples and will need separate follow-up if they are operator-facing.
