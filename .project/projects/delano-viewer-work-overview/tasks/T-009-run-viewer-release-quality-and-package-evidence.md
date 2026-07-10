---
id: T-009
name: Run viewer release quality and package evidence
status: planned
workstream: WS-D
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-008]
conflicts_with: [.delano/viewer/public/**, assets/payload/**, test/**, output/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-006
acceptance_criteria_ids: [AC-009]
---

# Task: Run viewer release quality and package evidence

## Description

Complete server/domain/UI/package/contract checks, delegate browser smoke through codex exec, fix scoped regressions, record evidence, and prepare closeout without remote writes unless separately requested.

## Acceptance Criteria

- [ ] Server tests, domain fixtures, changed-file lint/typecheck/build, npm test, asset build, manifest drift, and Delano validation pass or environmental exceptions are explicit
- [ ] Codex-delegated browser smoke passes Home, Review, Plan, Updated Files, filtered legacy table, compact/mobile, and reader/edit/live-update regression flows with repo-relative evidence
- [ ] Task/update evidence lists actual commands, results, skipped checks, final git status, and remaining risks; no public or remote action occurs without approval

## Traceability
- Story: US-006
- Acceptance criteria: AC-009

## Technical Notes

- Follow `.agents/rules/browser-delegation.md`: use scoped `codex exec` flows with the exact local URL and repo-relative evidence paths; do not spawn browser-automation subagents.
- Build UI source before root `npm run build:assets`, then run package manifest drift checks.
- Treat lint failures in untouched legacy files separately from changed-file lint, but do not hide them.
- Do not commit, push, open a PR, or mutate trackers unless the user explicitly expands the workflow.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
