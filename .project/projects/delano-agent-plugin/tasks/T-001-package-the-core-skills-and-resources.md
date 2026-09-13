---
id: T-001
name: Package the core skills and resources
status: done
workstream: WS-A
created: 2026-09-12T19:48:22Z
updated: 2026-09-12T20:02:37Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: feature
story_id:
acceptance_criteria_ids: []
---

# Task: Package the core skills and resources

## Description

Package all ten existing lifecycle skills and their supporting resources.

## Acceptance Criteria

- [x] Portable manifest and all ten focused skills are present with usable bundled references and templates.
- [x] The plugin has no dependency on deleted repository runtime folders.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes

Keep the package independent of the deleted agent runtime. No publishing or client installation is included.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-09-12T20:02:37Z: Implemented all ten lifecycle skills under plugins/delano/skills with package-relative resources, optional CLI usage, and explicit user-instruction precedence. Creator validation passed for all ten skills and the compatibility manifest. The portable manifest passed the published Agent Plugins 1.0.0 JSON schema.

- 2026-09-12T19:59:04Z: Implement portable package and resources.
- 2026-09-12T19:48:22Z: Created from .project/templates/task.md by `delano task add`.
