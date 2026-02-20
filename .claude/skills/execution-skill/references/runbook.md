# Execution Runbook

1. Pick dependency-safe task:
   - `bash .claude/scripts/pm/next.sh`
2. Set task status to `in-progress`.
3. Execute implementation in owned boundaries.
4. Record updates in `.project/projects/<slug>/updates/...`.
5. Surface blockers immediately:
   - `bash .claude/scripts/pm/blocked.sh`
6. Review active work:
   - `bash .claude/scripts/pm/in-progress.sh`

Exit gate:
- Work complete per acceptance criteria
- Evidence log updated
- Task ready for quality/review
