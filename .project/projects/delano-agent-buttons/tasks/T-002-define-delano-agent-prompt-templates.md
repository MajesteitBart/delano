---
id: T-002
name: Define Delano agent prompt templates
status: ready
workstream: WS-B
created: 2026-06-17T12:38:45Z
updated: 2026-06-17T14:02:00Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [.delano/viewer/public/app.jsx]
parallel: true
priority: high
estimate: M
story_id: US-001
acceptance_criteria_ids: [AC-000, AC-001, AC-003, AC-004, AC-005]
---

# Task: Define Delano agent prompt templates

## Description

Create concise prompt templates for v1 actions: carry project forward, carry task forward, and investigate blocker.

## Acceptance Criteria

- [ ] Prompts include project slug, workstream ID, task ID, source path, and first Delano CLI inspection commands where available.
- [ ] Prompts start with inspection commands and leave bulky context to file/CLI inspection.
- [ ] Prompts do not include raw task markdown.
- [ ] Prompts tell the agent to use Delano lifecycle commands instead of hand-editing status frontmatter.
- [ ] Prompts stay short enough for Claude Code deeplink limits and leave bulky context to CLI/file inspection.
- [ ] No v1 prompt contains direct project/workstream/task close commands unless framed as conditional and evidence-gated.
- [ ] Blocker prompts do not suggest reopening until dependencies and blocker metadata have been inspected.
- [ ] Prompt snapshots stay below the configured soft length threshold.

## Traceability
- Story: US-001
- Acceptance criteria: AC-000, AC-001, AC-003, AC-004, AC-005

## Technical Notes
- V1 templates are `carry-project-forward`, `carry-task-forward`, and `investigate-blocker`.
- All templates must include "do not edit status frontmatter directly" or equivalent wording.
- Prompt length policy: soft warning above 3,500 characters and hard fallback before Claude Code's 5,000-character `q` limit.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-17T12:38:45Z: Created from .project/templates/task.md by `delano task add`.
