---
name: learning-skill
intent: distill reusable decisions and lessons into project memory
---

# learning-skill

## Trigger context
- milestone or project closeout
- recurring failure pattern detected

## Required inputs
- project_slug
- retrospective_notes
- execution_logs

## Output schema
- updated `decisions.md`
- reusable lessons summary
- follow-up improvement items

## Quality checks
- every lesson links to observed evidence
- lessons are actionable and specific
- next-cycle improvements are prioritized

## Failure behavior
- if evidence is weak, return evidence gaps first

## Allowed side effects
- update `.project/projects/<slug>/decisions.md`
- append to project context/progress docs

## Script hooks
- `bash .claude/scripts/query-log.sh --last 200`
- `bash .claude/scripts/pm/status.sh`
