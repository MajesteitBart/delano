---
name: execution-skill
intent: execute mapped tasks with stream discipline and evidence updates
---

# execution-skill

## Trigger context
- tasks are ready and dependency-safe

## Required inputs
- task_ids
- stream_boundaries
- dependency_state

## Output schema
- updated task status
- progress updates
- delivery artifacts (commits/PRs/notes)

## Quality checks
- blockers explicit with owner/check-back time
- progress updates current
- stream boundaries respected

## Failure behavior
- stop work on hard blockers
- escalate file ownership conflict

## Allowed side effects
- update task frontmatter/status
- append updates under `.project/projects/<slug>/updates/`

## Script hooks
- `bash .claude/scripts/pm/in-progress.sh`
- `bash .claude/scripts/pm/standup.sh`
- `bash .claude/scripts/pm/next.sh`
