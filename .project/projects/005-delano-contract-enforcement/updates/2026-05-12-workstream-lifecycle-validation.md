# Workstream lifecycle validation tightened

Added status transition validation for workstream/task lifecycle consistency.

## Contract rule

- `in-progress` tasks require their parent workstream to be `active`.
- `done` tasks require their parent workstream to be `active` or `done`.
- A workstream with no open tasks must be `done` or `deferred`.

## Evidence

- 2026-05-12T10:55:58Z: `npm run check:status-transitions` passed.
- 2026-05-12T10:55:58Z: `node --test test/package.test.js` passed with 48 passing tests.
- 2026-05-12T10:55:58Z: `bash .agents/scripts/pm/validate.sh` passed with 0 errors and 0 warnings.
- 2026-05-12T10:55:58Z: `npm test` passed with 71 passing tests.
