# Execution Runbook

1. Pick a dependency-safe `ready` task:
   - `bash .agents/scripts/pm/next.sh`
   - Do not treat `planned` as selected work until it is explicitly promoted/readiness-reviewed.
2. Set task status to `in-progress`.
3. Execute implementation in owned boundaries.
4. Read any assigned published feedback directly from `.project/reviews/*.md`; verify its source content hash before treating anchors as current.
5. Record updates in `.project/projects/<slug>/updates/...`.
6. Surface blockers immediately:
   - `bash .agents/scripts/pm/blocked.sh`
7. Review active work:
   - `bash .agents/scripts/pm/in-progress.sh`

Exit gate:
- Work complete per acceptance criteria
- Evidence log updated
- Task ready for quality/review
