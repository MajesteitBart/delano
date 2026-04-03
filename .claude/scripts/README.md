# Delano Runtime Scripts

This folder contains the script runtime described in `HANDBOOK.md`.

Canonical path: `.agents/scripts/...`

Compatibility path: `.claude/scripts/...` when the mirror is present.

## PM scripts (`.agents/scripts/pm/`)

Critical path:
- `init.sh`
- `validate.sh`
- `status.sh`
- `next.sh`
- `blocked.sh`

Operational:
- `standup.sh`
- `in-progress.sh`
- `prd-list.sh`
- `epic-list.sh`
- `search.sh`

## Audit and utility
- `log-event.sh` / `log-event.js`
- `query-log.sh`
- `test-and-log.sh`
- `check-path-standards.sh`
- `fix-path-standards.sh`
- `git-sparse-download.sh`
