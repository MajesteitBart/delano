---
id: T-005
name: Add roadmap CLI lifecycle commands
status: planned
workstream: WS-B
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T01:03:35Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-004]
conflicts_with: [src/cli/index.js, src/cli/commands/roadmap.js, src/cli/lib/roadmap-state.js, test/cli.test.js]
parallel: true
priority: high
estimate: L
operating_mode: multi-stream
story_id: US-002,US-006
acceptance_criteria_ids: [AC-002, AC-003, AC-005]
---

# Task: Add roadmap CLI lifecycle commands

## Description

Add the native roadmap command/service boundary for non-destructive initialization, item creation/read, horizon moves, lifecycle actions, and stable human/JSON output.

## Acceptance Criteria

- [ ] General and command help document `roadmap init|add|show|move|start|close|defer|promote` and contain no scheduling fields.
- [ ] `roadmap init` creates only missing vision, mission, and roadmap README seeds and reports created/skipped paths without overwrite.
- [ ] `roadmap add` creates a schema-valid planned item, creates the roadmap directory when needed, rejects duplicate IDs, and preserves immutable `created`.
- [ ] `roadmap show` returns the item plus the derived linked-project/receipt projection in stable human and JSON formats.
- [ ] Move/start/close/defer actions accept only their documented fields and enforce the lifecycle/closure contract before writing.
- [ ] Each single-item mutation writes `updated` once and leaves all non-whitelisted frontmatter/body bytes unchanged except an explicit evidence/reason append.
- [ ] Temporary-repository CLI tests cover success, invalid input, missing item, duplicate ID, invalid transition, and no-overwrite initialization.

## Traceability
- Story: US-002,US-006
- Acceptance criteria: AC-002, AC-003, AC-005

## Technical Notes

Expose service functions beneath argument parsing so the viewer can call them in-process. Keep promotion command registration/help in this task; T-006 completes its creation semantics.
## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] CLI help updated

## Evidence Log
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
