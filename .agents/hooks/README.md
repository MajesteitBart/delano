# Delano Hook Layer

This directory contains optional runtime hooks for session and mutation tracking.

Default hooks:
- `session-tracker.js`
- `post-tool-logger.js`
- `user-prompt-logger.js`
- `bash-worktree-fix.sh`

All hooks append JSONL records in `.claude/logs/`.
