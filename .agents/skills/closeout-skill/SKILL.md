---
name: closeout-skill
description: Close the delivery loop and capture completion evidence, status updates, and handoff artifacts. Use after quality gates pass.
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

## Execution assets
- `references/runbook.md`
- `templates/outcome-review.md`
- `templates/closure-checklist.md`
