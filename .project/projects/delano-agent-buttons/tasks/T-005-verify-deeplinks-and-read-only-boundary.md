---
id: T-005
name: Verify deeplinks and read-only boundary
status: blocked
workstream: WS-D
created: 2026-06-17T12:39:15Z
updated: 2026-06-17T14:02:00Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-001, T-002, T-003]
conflicts_with: [test, .delano/viewer/public/app.jsx]
parallel: true
priority: medium
estimate: M
story_id: US-003
acceptance_criteria_ids: [AC-000, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007]
blocked_owner: dependency
blocked_check_back: 2026-06-24
---

# Task: Verify deeplinks and read-only boundary

## Description

Add tests or smoke checks for deeplink encoding, prompt contents, provider URL shape, and the viewer read-only boundary.

## Acceptance Criteria

- [ ] Tests cover Codex and Claude Code URL generation with encoded prompt/path values.
- [ ] Tests cover unsupported provider/action values and path traversal attempts.
- [ ] Tests cover prompt soft warning above 3,500 characters and hard fallback before Claude Code's 5,000-character `q` limit.
- [ ] Tests assert no agent endpoint invokes Delano lifecycle commands.
- [ ] Tests assert generated prompts instruct agents to use Delano CLI rather than hand-editing status frontmatter.
- [ ] Tests assert `/api/index`, docs, fixtures, snapshots, and normal logs do not expose absolute local provider URLs.
- [ ] Tests or browser smoke verify agent buttons render on project overview, task detail, and blocked-task contexts without changing Delano state directly.
- [ ] Manual smoke confirms provider opens with prompt prefilled but not sent.
- [ ] File tree diff before/after clicking agent buttons shows no `.project` mutation.
- [ ] Validation confirms lifecycle actions remain Delano CLI prompt instructions, not viewer writes.

## Traceability
- Story: US-003
- Acceptance criteria: AC-000, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007

## Technical Notes
- Official URL shape is accepted for T-001; desktop handler behavior is verified manually here.
- Handler-missing behavior must keep copy prompt available.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log

- 2026-06-17T13:46:07Z: Dependency updated after lifecycle presets moved out of v1; validation now waits on T-001, T-002, and T-003.
- 2026-06-17T12:39:15Z: Created from .project/templates/task.md by `delano task add`.
