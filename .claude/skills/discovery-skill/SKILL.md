---
name: discovery-skill
intent: define and approve a measurable outcome and Spec
---

# discovery-skill

## Trigger context
- New delivery request with undefined scope
- Existing scope lacks clear outcome or owner

## Required inputs
- project_slug
- project_name
- owner
- outcome_hypothesis
- constraints

## Output schema
- `.project/projects/<slug>/spec.md`
- clarified outcome statement
- open questions list

## Quality checks
- measurable success criteria present
- explicit non-goals present
- dependency assumptions documented

## Failure behavior
- stop if objective is ambiguous
- return a clarification question set

## Allowed side effects
- create project scaffold through init script
- update `spec.md`

## Script hooks
- `bash .claude/scripts/pm/init.sh <slug> "<Project Name>" <owner> <lead>`
- `bash .claude/scripts/pm/validate.sh`
