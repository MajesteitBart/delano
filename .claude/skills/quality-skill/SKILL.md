---
name: quality-skill
intent: verify release readiness and gate closure
---

# quality-skill

## Trigger context
- target tasks are implemented and ready for verification

## Required inputs
- changed_scope
- risk_level
- test_requirements

## Output schema
- quality_evidence bundle
- pass/fail gate decision

## Quality checks
- required tests executed by risk level
- acceptance criteria complete
- unresolved critical defects = 0

## Failure behavior
- stop merge readiness on failed critical checks
- emit remediation checklist

## Allowed side effects
- append evidence logs in task files
- write test logs under `.claude/logs/tests/`

## Script hooks
- `bash .claude/scripts/test-and-log.sh <command>`
- `bash .claude/scripts/pm/validate.sh`

## Execution assets
- `references/runbook.md`
- `templates/quality-evidence.md`
- `templates/gate-decision.md`
