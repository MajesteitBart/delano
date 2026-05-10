# WS-E fixture-backed validation completed

Implemented fixture-backed validation for generated Spec Kit interop artifacts.

Artifacts added or updated:

- `scripts/check-spec-kit-interop-fixtures.mjs`
- `package.json` script: `check:spec-kit-interop`
- `test/cli.test.js` subtest
- `.agents/scripts/pm/import-spec-kit.sh` and `.claude/scripts/pm/import-spec-kit.sh` now preserve explicit User Stories, Acceptance Scenarios, Assumptions, and Needs Clarification sections in imported specs.

Fixture behavior:

- Runs `delano import-spec-kit ... --json`.
- Verifies generated spec, plan, update, and tasks.
- Runs `delano research ... --json`.
- Verifies generated research files.
- Requires default Delano validation to pass.
- Cleans up smoke artifacts afterward.

Outcome:

- T-007 is now `done`.
- T-008 is now `ready` because T-004, T-005, T-006, and T-007 are done.
