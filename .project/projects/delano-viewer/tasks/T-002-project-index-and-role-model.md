---
id: T-002
name: Project index and role model
status: done
workstream: WS-A
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Project index and role model

## Description

Model Delano project artifacts explicitly so the viewer can navigate specs, plans, workstreams, tasks, progress, decisions, context, and templates instead of acting as a flat file browser.

## Acceptance Criteria
- [x] Index metadata includes artifact role, project slug, title, status, task ID, workstream ID, dependencies, snippet, update timestamp, frontmatter, and path.
- [x] Project outlines include spec, plan, decisions, progress, workstreams, grouped tasks, and unassigned tasks.
- [x] Context and template folders are represented alongside projects.
- [x] Task/workstream relationships are represented well enough for the current contracts.

## Technical Notes

- Role classification is currently path and metadata based.
- Workstream/task grouping may need stronger contract links in a future project.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Server implementation includes role derivation, project outlines, frontmatter parsing, relationship extraction, and task/workstream grouping.
- 2026-04-28: Viewer README documents indexed roles and project outline behavior.
- 2026-04-28: Marked done after operator confirmation.
