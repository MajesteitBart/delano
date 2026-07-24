---
id: T-001
name: Define the roadmap artifact and lifecycle contract
status: done
workstream: WS-A
created: 2026-07-24T00:59:22Z
updated: 2026-07-24T06:37:09Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [.agents/schemas/artifact-scope.json, .agents/schemas/artifacts/roadmap-item.schema.json, .project/templates/roadmap-item.md]
parallel: true
priority: high
estimate: M
operating_mode: multi-stream
story_id: US-002,US-004
acceptance_criteria_ids: [AC-003, AC-005]
---

# Task: Define the roadmap artifact and lifecycle contract

## Description

Define the canonical roadmap item path, frontmatter/body schema, lifecycle matrix, closure eligibility, and template/rule text before any command or viewer surface mutates the artifact.

## Acceptance Criteria

- [x] The artifact contract accepts only `.project/roadmap/RM-###-<slug>.md` item paths with matching `id`.
- [x] Required frontmatter is exactly `id`, `name`, `status`, `horizon`, `created`, and `updated`; required body sections are Strategic intent, Outcome signal, Boundaries, and Closure evidence.
- [x] Status and horizon enums plus active/terminal combination rules are documented in one canonical rule and represented in the artifact schema.
- [x] The contract contains no date target, dependency, estimate, assignee, project-list, velocity, or percentage-complete field.
- [x] The roadmap-item template and focused valid/invalid schema fixtures agree with the canonical rule.

## Traceability
- Story: US-002,US-004
- Acceptance criteria: AC-003, AC-005

## Technical Notes

Model terminal archive behavior as a projection rule, not a fourth horizon. Keep datetime requirements aligned with the existing UTC/immutable-created convention. Do not implement project reference resolution in this task; T-003 owns cross-artifact enforcement.
## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Contract rule and template updated

## Evidence Log

- 2026-07-24T06:37:09Z: Canonical rule, schema, template, and five fixtures implemented; node --test test/roadmap-contract.test.js passed 2/2; artifact scope and schema checks passed for 10 types.

- 2026-07-24T06:35:25Z: Implement canonical roadmap artifact and lifecycle contract

- 2026-07-24T06:35:24Z: Dependency review complete; no prerequisites
- 2026-07-24T00:59:22Z: Created from .project/templates/task.md by `delano task add`.
