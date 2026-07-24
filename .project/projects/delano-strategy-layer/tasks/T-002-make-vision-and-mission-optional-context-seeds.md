---
id: T-002
name: Make vision and mission optional context seeds
status: done
workstream: WS-A
created: 2026-07-24T00:59:23Z
updated: 2026-07-24T06:39:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [src/cli/lib/context-reader.js, scripts/audit-context-files.mjs, .project/templates/vision.md, .project/templates/mission.md]
parallel: true
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002]
---

# Task: Make vision and mission optional context seeds

## Description

Add non-destructive vision and mission seed templates and make the overview context profile include them only when present, preserving silent behavior for repositories that do not adopt them.

## Acceptance Criteria

- [x] Vision and mission seed templates contain a title and guiding prompts but no required body structure or minimum word count.
- [x] `delano context read --profile overview` includes present vision/mission files in deterministic order.
- [x] The same command emits no missing-file warning and unchanged required-file output when both optional files are absent.
- [x] Neither optional file is added to the required fallback list.
- [x] The diagnostic context-file audit exempts vision/mission from word-count placeholder classification without weakening other file checks.
- [x] Focused tests cover both absent and present optional-profile repositories.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001, AC-002

## Technical Notes

Represent optional profile members explicitly rather than filtering every fixed profile filename globally. Keep `context` read-only; creation belongs to `delano roadmap init` in T-005.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Documentation impact recorded for T-013

## Evidence Log

- 2026-07-24T06:39:22Z: Vision/mission templates and presence-aware overview selection implemented; fallback unchanged; focused context/audit tests passed 3/3.

- 2026-07-24T06:37:09Z: Implement presence-aware direction context

- 2026-07-24T06:37:09Z: Dependency review complete; independent of roadmap schema
- 2026-07-24T00:59:23Z: Created from .project/templates/task.md by `delano task add`.
