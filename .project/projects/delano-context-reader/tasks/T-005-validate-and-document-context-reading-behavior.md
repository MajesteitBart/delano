---
id: T-005
name: Validate and document context reading behavior
status: blocked
workstream: WS-D
created: 2026-06-24T21:51:46Z
updated: 2026-06-24T21:51:46Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-003, T-004]
conflicts_with: [docs/cli-reference.md, docs/user-guide.md, assets/install-manifest.json]
parallel: true
priority: high
estimate: S
story_id: US-004
acceptance_criteria_ids: [AC-004, AC-006, AC-007]
blocked_owner: team
blocked_check_back: 2026-06-26
---

# Task: Validate and document context reading behavior

## Description

Add the tests, fixtures, docs, and validation evidence needed to trust context reading as a stable Delano feature.

## Acceptance Criteria

- [ ] Tests cover canonical ordering, profiles, JSON output, markdown boundaries, and output limits.
- [ ] Tests cover unsafe selectors: absolute paths, traversal, non-context files, missing files, and symlink escape where portable.
- [ ] Package/manifest checks pass if new CLI files are included in the packaged payload.
- [ ] Docs explain `delano context` list/read behavior with repo-relative examples only.
- [ ] Docs explicitly state context reading is read-only and does not summarize or mutate files.
- [ ] Validation confirms no absolute local path leakage in docs, fixtures, snapshots, or contract files.
- [ ] `delano validate` passes before handoff.

## Traceability

- Story: US-004
- Acceptance criteria: AC-004, AC-006, AC-007

## Technical Notes

- Prefer focused fixtures over huge real context dumps.
- If symlink behavior is platform-sensitive, test the invariant that the reader refuses resolved paths outside `.project/context`.
- Keep examples short so docs remain readable.

## Definition of Done

- [ ] Implementation complete
- [ ] Tests pass
- [ ] Docs updated
- [ ] `delano validate` evidence recorded

## Evidence Log

- 2026-06-24T21:51:46Z: Waiting for implementation surfaces from T-003/T-004.
- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
