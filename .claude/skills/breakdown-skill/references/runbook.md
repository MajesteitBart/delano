# Breakdown Runbook

1. Read `plan.md` and `workstreams/*.md`.
2. Generate atomic tasks from `.project/templates/task.md`.
3. Add binary acceptance criteria per task.
4. Add dependencies and estimate/priority fields.
5. Run sequencing checks:
   - `bash .claude/scripts/pm/next.sh --all`
   - `bash .claude/scripts/pm/blocked.sh`
6. Validate:
   - `bash .claude/scripts/pm/validate.sh`

Exit gate:
- Tasks are atomic
- Dependencies are acyclic
- Ready tasks are execution-safe
