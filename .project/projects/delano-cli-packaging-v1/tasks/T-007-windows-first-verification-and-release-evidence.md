---
id: T-007
name: Windows-first verification and release evidence
status: done
workstream: WS-D
created: 2026-04-03T12:00:36Z
updated: 2026-05-04T00:00:00Z
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
- 2026-05-04: Prepared corrected vNext release `@bvdm/delano` `0.2.0` for publication. `npm run build:assets` built 184 manifest entries, `npm test` passed 51/51 tests, `npm run check:package-manifest` passed, `node bin/delano.js --version` returned `0.2.0`, `bash .agents/scripts/pm/validate.sh` passed with 0 errors and 0 warnings, and `npm pack` produced `bvdm-delano-0.2.0.tgz` with 219 files. Registry inspection showed `0.1.8` as the current latest after an earlier mistaken patch-version publish attempt; `0.2.0` is the intended vNext release version. `npm publish --access public` rebuilt the tarball but stopped with `EOTP`, requiring npm one-time browser/OTP authentication before the corrected release can publish.
- 2026-05-04: Replaced the token/OTP-oriented publish workflow with GitHub Actions trusted publishing. `.github/workflows/publish-npm.yml` now grants `id-token: write`, uses Node 24 for npm trusted publishing support, runs `npm run build:assets`, `npm run check:package-manifest`, `npm test`, and `npm pack --dry-run`, blocks already-published versions, and publishes from Actions with `npm publish --access public`. README publishing guidance records the required one-time npm trusted publisher configuration.
- 2026-05-04: Investigated failed GitHub Actions publish run for `v0.2.1`. The run passed package checks and failed only at `npm publish` with `E404`; the job permission summary did not show `id-token: write`. Moved publish workflow OIDC permissions to workflow scope, added an explicit pre-publish OIDC environment check, and documented npm trusted publisher mismatch as the first `E404` troubleshooting path. Validation passed: `npm run check:package-manifest`; `npm test`.
