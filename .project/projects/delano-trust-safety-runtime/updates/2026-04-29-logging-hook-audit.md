---
created: 2026-04-29T22:30:00Z
updated: 2026-04-29T22:30:00Z
status: audit-complete
related_task: T-001
---

# Logging and hook output audit

## Scope inspected

- `.agents/hooks/user-prompt-logger.js`
- `.agents/hooks/post-tool-logger.js`
- `.agents/hooks/session-tracker.js`
- `.agents/hooks/bash-worktree-fix.sh`
- `.agents/logs/schema.md`
- `.agents/scripts/log-event.js`
- `.agents/scripts/log-event.sh`
- `.agents/scripts/test-and-log.sh`
- `.agents/scripts/check-path-standards.sh`

## Findings

1. Raw prompt logging is enabled whenever `user-prompt-logger.js` receives prompt text.
   - It writes the complete prompt to `.agents/logs/prompts.jsonl`.
   - There is no opt-in environment variable or configuration gate.
   - There is no redaction pass before persistence.

2. Tool/change logging can persist arbitrary metadata.
   - `post-tool-logger.js` writes `payload.meta` directly to `.agents/logs/changes.jsonl`.
   - `log-event.js` writes CLI-provided key/value metadata directly to the same file.
   - These flows are useful, but should share redaction before writing.

3. Test logging can persist command output and command strings.
   - `test-and-log.sh` saves full stdout/stderr into `.agents/logs/tests/<id>.log`.
   - It also records the full command string in `.agents/logs/test-runs.jsonl`.
   - This is expected for evidence, but should be documented as potentially sensitive.

4. Session logging stores session IDs.
   - `session-tracker.js` stores `sessionId` in `.agents/logs/sessions.jsonl`.
   - This is lower-risk than prompts but still operational metadata.

5. Hook output leaks absolute paths.
   - `bash-worktree-fix.sh` echoes the full repository root.
   - The path scanner excludes runtime logs and only scans selected shared artifacts, so hook terminal output can still leak paths when copied into issues, PRs, or reports.

6. The documented log schema endorses raw prompt persistence.
   - `.agents/logs/schema.md` documents `prompt: string` as the prompt log shape.
   - This should change to a privacy-safe shape with hashes, redaction metadata, and optional explicitly enabled raw text.

## Recommended implementation order

1. Add shared log-safety/redaction helper.
2. Make raw prompt logging opt-in and default to hash/length/redaction metadata only.
3. Apply redaction to change/tool metadata and log-event metadata.
4. Change `bash-worktree-fix.sh` to avoid printing absolute roots by default.
5. Update log schema docs and validation checks.
