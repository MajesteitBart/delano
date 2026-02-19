---
name: closeout-skill
intent: close delivery loop and capture completion evidence
---

# closeout-skill

## Trigger context
- quality gates passed for closure scope

## Required inputs
- project_slug
- completed_task_ids
- outcome_review

## Output schema
- closure update
- completion summary
- updated status in contracts/registry

## Quality checks
- required tasks resolved
- evidence package complete
- outcome review captured

## Failure behavior
- block closure when evidence is incomplete
- return missing-evidence list

## Allowed side effects
- update project/task statuses
- append completion summary and release evidence

## Script hooks
- `bash .claude/scripts/pm/status.sh`
- `bash .claude/scripts/query-log.sh --last 50`
- `bash .claude/scripts/pm/validate.sh`
