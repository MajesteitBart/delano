# Closeout Runbook

1. Confirm all required tasks are in terminal state.
2. Ensure quality evidence package is complete.
3. Write completion summary from template.
4. Update project status and mapping registry.
5. Review event log:
   - `bash .claude/scripts/query-log.sh --last 100`
6. Validate:
   - `bash .claude/scripts/pm/status.sh`
   - `bash .claude/scripts/pm/validate.sh`

Exit gate:
- Outcome review captured
- Evidence complete
- Delivery state closed cleanly
