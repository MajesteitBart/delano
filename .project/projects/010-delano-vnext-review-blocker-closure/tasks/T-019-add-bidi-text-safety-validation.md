---
id: T-019
name: Add bidi text-safety validation
status: done
workstream: WS-D
created: 2026-05-04T10:44:46Z
updated: 2026-05-04T10:49:06Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: S
---

# Task: Add bidi text-safety validation

## Description

Add a lightweight tracked-file safety check for Unicode bidirectional control characters and wire it into PM validation.

## Acceptance Criteria
- [x] Validation fails on `U+202A..U+202E`, `U+2066..U+2069`, `U+200E`, and `U+200F`.
- [x] The check scans tracked files by default.
- [x] The check is wired into `.agents/scripts/pm/validate.sh`.
- [x] Regression coverage proves a bidi control character is rejected.
- [x] Installed runtime manifest includes the shipped check script.

## Technical Notes
- This addresses GitHub's hidden/bidirectional Unicode warning class without banning ordinary non-ASCII text.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-05-04T10:44:46Z: Added `check-text-safety.mjs` across root, `.agents`, and `.claude`; wired PM validation; added manifest and regression coverage.
- 2026-05-04T10:49:06Z: `node scripts/check-text-safety.mjs` passed for tracked files; targeted bidi sample rejected `U+202E` with basename-only diagnostics; `npm test` passed with 51 tests; `bash .agents/scripts/pm/validate.sh` passed with Errors: 0 and Warnings: 0.
