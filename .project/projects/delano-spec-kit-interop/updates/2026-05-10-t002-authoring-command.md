# T-002 authoring command path completed

Added the first prototype authoring/import command path:

- `delano import-spec-kit -- <slug> <source-md> [project-name] [owner] [lead]`
- `.agents/scripts/pm/import-spec-kit.sh`

Supporting docs updated:

- `README.md`
- `docs/user-guide.md`
- `docs/spec-kit/import-contract.md`

Smoke validation:

- `2026-05-10T09:15:00Z`: Ran `node bin/delano.js import-spec-kit -- spec-kit-import-smoke docs/spec-kit/fixtures/minimal-spec-kit-project.md "Reminder Email Preferences" smoke-team smoke-lead`.
- The command generated `.project/projects/spec-kit-import-smoke/`, ran Delano validation successfully, and the smoke project was removed afterward.

Outcome:

- T-002 is now `done`.

## Agent-facing CLI audit

`2026-05-10T10:42:00Z`: Reviewed command input/output from an agent perspective. Findings and changes:

- Removed the need for `--` passthrough in documented usage.
- Added named options: `--name`, `--owner`, `--lead`.
- Kept backward-compatible positional metadata for existing calls.
- Added `--json` so agents can parse a single result object.
- Added command-specific help instead of the generic wrapper help.
- Confirmed the command refuses to overwrite existing project folders.
