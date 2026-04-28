---
id: T-007
name: Windows-first verification and release evidence
status: done
workstream: WS-D
created: 2026-04-03T12:00:36Z
updated: 2026-04-28T22:08:32Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003, T-004, T-006]
conflicts_with: []
parallel: false
priority: high
estimate: M
---

# Task: Windows-first verification and release evidence

## Description

Verify the packaged CLI and wrapper commands in the current Windows-first environment and capture the evidence needed to ship the first release with confidence.

## Acceptance Criteria
- [x] First install, conflict failure, and `--force` reinstall flows are exercised against temporary targets.
- [x] `delano init`, `delano validate`, `delano status`, and `delano next` are smoke-tested through the CLI.
- [x] The installed file set is checked against the approved payload and does not include unapproved top-level docs by default.
- [x] Verification evidence is recorded clearly enough for closeout and future regression checks.

## Technical Notes

- Prefer realistic Windows-first shell conditions over idealized cross-platform assumptions.
- Include checks around `.project`, `.agents`, and `.agents/skills` conflict handling because those are the highest-risk write surfaces.
- Use this task to decide whether any exposed PM-script output quirks need targeted follow-up before release.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Task created during breakdown for the Delano CLI packaging project.
- 2026-04-03: Verified `npm run build:assets`, `npm test`, `node bin/delano.js --help`, `node bin/delano.js status`, install success/conflict/force flows against `tmp/cli-install-smoke`, non-forceable parent blockers against `tmp/cli-parent-blocker`, wrapper commands in the installed scratch repo, and `npm pack --dry-run`. Confirmed the installed payload omits `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, and `PI.md`.
- 2026-04-17: Bumped `@bvdm/delano` from `0.1.5` to `0.1.6`, ran `bash .agents/scripts/test-and-log.sh npm test` (log: `.agents/logs/tests/20260417T152814Z.log`), ran `bash .agents/scripts/pm/validate.sh`, rebuilt assets with `npm run build:assets`, confirmed `node bin/delano.js --version` returned `0.1.6`, and verified `npm pack --dry-run` produced `bvdm-delano-0.1.6.tgz` with 128 files. `npm publish --access public` rebuilt the tarball successfully but failed with `E404` for `@bvdm/delano`, indicating missing npm auth or publish permission for the `@bvdm` scope.
- 2026-04-28: Marked done after operator confirmation and final package verification rerun.
- 2026-04-28: Final closeout rerun passed: `npm test` (11/11), `npm run build:assets` (111 files), `node bin/delano.js --version` (`0.1.7`), `node bin/delano.js --help`, `npm pack --dry-run` (`bvdm-delano-0.1.7.tgz`, 136 files), and `bash .agents/scripts/pm/validate.sh`. npm publish access remains an external follow-up.
