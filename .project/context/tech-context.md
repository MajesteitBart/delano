# Tech Context

## Stack
- Markdown contracts and templates for delivery artifacts.
- Bash for the PM/operator script layer.
- Python for validation and dependency-graph checks.
- Git for repository discovery, sparse installs, and sync-oriented workflows.
- Node/npm is the intended packaging surface for the next CLI initiative, but not yet the execution layer for Delano itself.

## Runtime Constraints
- Current operator environment is Windows-first with PowerShell available; Delano still assumes `bash`, `git`, and a usable Python runtime.
- Canonical command paths should use `.agents/scripts/...`; `.claude/scripts/...` is compatibility-only when the mirror exists.
- Shared docs and contracts must avoid absolute path leakage.
- `.project` and `.agents` are seeded artifacts and runtime assets, not package-owned mutable state after install.

## Integration Points
- `.project/registry/linear-map.json` and `.project/registry/migration-map.json` capture tracker mapping state.
- `.agents/scripts/pm/init.sh`, `validate.sh`, `status.sh`, `next.sh`, and `blocked.sh` are the current critical-path operator interface.
- `install-delano.sh` is the current shell-first bootstrap path for installing Delano into another repository.
