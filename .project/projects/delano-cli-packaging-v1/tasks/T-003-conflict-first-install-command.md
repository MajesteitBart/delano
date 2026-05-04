---
id: T-003
name: Conflict-first install command
status: done
workstream: WS-B
created: 2026-04-03T12:00:36Z
updated: 2026-05-04T00:00:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-002]
conflicts_with: []
parallel: false
priority: high
estimate: L
---

# Task: Conflict-first install command

## Description

Implement `delano install` so it computes the full write plan first, reports conflicts clearly, and writes only allowlisted paths unless the user explicitly chooses `--force`.

## Acceptance Criteria
- [x] `delano install` supports at least `--target`, `--agents`, `--force`, and `--yes`.
- [x] The command computes the full install plan before writing files.
- [x] Conflicts report the path, its type (`file`, `directory`, or `symlink`), and the reason it blocks install.
- [x] Without `--force`, conflicting writes abort the install.
- [x] With `--force`, only allowlisted payload paths are overwritten.

## Technical Notes

- Be especially conservative around `.project/**`, `.agents/**`, and `.agents/skills/**`.
- The install manifest written by the CLI should be small and useful for later repair or upgrade reasoning.
- Do not silently create or mutate top-level adapter entry docs in the normal base install path.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Implemented conflict-first `delano install` with allowlist-driven planning, sorted conflict reports, safe force behavior, and parent-path blocker detection. Smoke-tested first install, conflict failure, force reinstall, and non-forceable parent blockers.
- 2026-04-28: Marked done after operator confirmation and final package verification rerun.
- 2026-05-04: Added granular install selection for update-safe refreshes: `--only`, `--exclude`, `--no-project-context`, and `--no-project-state`. Verified category filtering protects repo-owned `.project/context`, `.project/projects`, and `.project/registry` when excluded. Evidence: `node --test test/cli.test.js`, `node --test test/package.test.js`, `npm test`, `bash .agents/scripts/pm/validate.sh`, and a temporary `delano install --only skills,project-templates --yes` smoke test passed.
- 2026-05-04: Added `delano install --interactive` / `--tui` with preset-driven terminal selection for update-safe runtime refresh, skills plus project templates, full install or repair, and custom category selection. Evidence: `npm test`, `bash .agents/scripts/pm/validate.sh`, and a piped interactive smoke test for preset 2 passed.
