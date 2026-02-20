---
name: breakdown-skill
intent: decompose approved plan into atomic tasks
---

# breakdown-skill

## Trigger context
- plan is complete and ready for decomposition

## Required inputs
- spec_path
- plan_path
- workstream_files

## Output schema
- task_files
- dependency_graph

## Quality checks
- acceptance criteria are binary
- estimate present per task
- dependency graph acyclic

## Failure behavior
- stop on circular dependency
- return ambiguity report

## Allowed side effects
- create/update `.project/projects/<slug>/tasks/*.md`

## Script hooks
- `bash .claude/scripts/pm/validate.sh`
- `bash .claude/scripts/pm/next.sh`
- `bash .claude/scripts/pm/blocked.sh`

## Execution assets
- `references/runbook.md`
- `templates/task-batch-summary.md`
- `templates/ambiguity-report.md`
