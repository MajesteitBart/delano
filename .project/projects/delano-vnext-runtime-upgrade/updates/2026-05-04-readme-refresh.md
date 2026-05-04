---
created: 2026-05-04T13:20:00Z
updated: 2026-05-04T13:20:00Z
status: documented
---

# Update: README refreshed after latest main merges

Updated `README.md` to reflect the latest main merges:

- PR #4, `feat/delano-vnext-runtime-upgrade`, for the v0.2 runtime validation, safety, sync, lease, metrics, eval, and compact agent-instruction work.
- PR #3, `delano-viewer-design-overhaul`, for the packaged read-only viewer and `.project` navigation experience.

Also added a root `LICENSE` file with the MIT license and changed `package.json` license metadata from `UNLICENSED` to `MIT`.

Evidence:

- `npm test` passed with 51 tests.
- `bash .agents/scripts/pm/validate.sh` passed with `Errors: 0` and `Warnings: 0`.
- After the MIT license update, `npm test` passed with 51 tests.
- After the MIT license update, `bash .agents/scripts/pm/validate.sh` passed with `Errors: 0` and `Warnings: 0`.
