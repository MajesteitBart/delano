---
id: T-003
name: Add delano context CLI commands
status: done
workstream: WS-B
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:33:59Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002]
conflicts_with: [bin/delano.js, src/cli/index.js, src/cli/commands]
parallel: true
priority: high
estimate: M
story_id: US-002
acceptance_criteria_ids: [AC-003, AC-004, AC-005]
---

# Task: Add delano context CLI commands

## Description

Expose the shared context reader through a clean CLI surface for humans and agents. The command should make the obvious path easy: list available context, then read a focused profile or exact files in markdown or JSON.

## Acceptance Criteria

- [x] `delano context list` or equivalent prints available context files in canonical order.
- [x] `delano context list --json` returns stable machine-readable metadata.
- [x] `delano context read --profile <name>` or equivalent reads a named context profile.
- [x] Exact file selection is supported with `.project/context`-relative names only.
- [x] Markdown output uses deterministic file section boundaries.
- [x] JSON output includes selected file metadata, content, warnings, and truncation information.
- [x] CLI returns clear non-zero errors for unsafe selectors, unknown profiles, unreadable files, and strict missing-file failures.
- [x] Help text includes examples that use repo-relative paths only.

## Traceability

- Story: US-002
- Acceptance criteria: AC-003, AC-004, AC-005

## Technical Notes

- Keep command syntax narrow. Do not add edit/generate/summarize modes in this project.
- The CLI should call the shared helper from T-002 rather than reimplementing discovery or path checks.
- Consider future package payload updates if new command files are added.

## Definition of Done

- [x] Implementation complete
- [x] Tests pass
- [x] Help/docs updated
- [x] Package/manifest checks pass if payload changed

## Evidence Log

- 2026-06-25T10:33:59Z: Added delano context list and delano context read CLI commands in src/cli/commands/context.js and registered them in src/cli/index.js. CLI supports JSON, markdown reads, profiles, exact selectors, strict mode, max character budgets, and target override. Passed context-focused tests: node --test --test-name-pattern context test/cli.test.js. Live CLI smoke passed for context list --json and context read --profile implementation --json; traversal selector returned non-zero with a clear path traversal error.

- 2026-06-25T10:32:49Z: Adding delano context list/read CLI commands backed by the shared context reader helper

- 2026-06-25T10:32:45Z: Dependency T-002 is done; shared context reader helper is implemented and tested.

- 2026-06-24T21:51:46Z: Waiting for the safe context reader library from T-002.
- 2026-06-24T21:51:46Z: Created from .project/templates/task.md by `delano task add`.
