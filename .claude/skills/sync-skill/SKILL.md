---
name: sync-skill
intent: reconcile local contracts with Linear and GitHub
---

# sync-skill

## Trigger context
- active tasks changed
- status or dependency drift suspected

## Required inputs
- project_slug
- local_registry
- task_files

## Output schema
- updated_registry
- drift_report

## Quality checks
- active tasks mapped
- no duplicate mapping
- dependency parity pass

## Failure behavior
- dry-run when uncertainty detected
- emit conflict resolution actions

## Allowed side effects
- update `.project/registry/linear-map.json`
- update local IDs/links in task contracts

## Script hooks
- `bash .claude/scripts/pm/status.sh`
- `bash .claude/scripts/pm/validate.sh`
