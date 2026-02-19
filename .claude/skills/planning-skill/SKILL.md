---
name: planning-skill
intent: translate approved Spec into executable Delivery Plan
---

# planning-skill

## Trigger context
- `spec.md` approved and active

## Required inputs
- spec_path
- architecture_constraints
- dependency_inputs

## Output schema
- `.project/projects/<slug>/plan.md`
- `.project/projects/<slug>/workstreams/*.md`

## Quality checks
- architecture decisions justified
- rollout and rollback path documented
- workstream boundaries explicit

## Failure behavior
- stop on unresolved architectural conflicts
- return tradeoff matrix and decision prompts

## Allowed side effects
- create/update `plan.md`
- create/update `workstreams/*.md`

## Script hooks
- `bash .claude/scripts/pm/validate.sh`
- `bash .claude/scripts/pm/status.sh`

## Execution assets
- `references/runbook.md`
- `templates/architecture-decision.md`
- `templates/workstream-definition.md`
