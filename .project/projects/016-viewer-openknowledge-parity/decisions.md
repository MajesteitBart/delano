---
name: Viewer OpenKnowledge Parity
slug: 016-viewer-openknowledge-parity
owner: bart
created: 2026-07-09T23:54:25Z
updated: 2026-07-10T00:35:00Z
---

# Decisions: Viewer OpenKnowledge Parity

## Active Decisions
- D-001 (2026-07-10): Editor saves reuse the existing `POST /api/apply` endpoint verbatim (`sourcePath`, `replacementMarkdown`, `expectedHash`, `confirm: true`). Inspection showed it already implements every T-003 requirement — path scoping, hash check with 409 + `currentBaseline`, confirm gate, audit trail — and `test/viewer-server.test.js` already covers stale-hash 409, malformed payloads, and successful writes. No new endpoint; T-003 narrows to client integration plus an `editor` audit reason.
- D-002 (2026-07-10): Activity feed is in-memory only (server ring buffer, cap 200); it does not persist across viewer restarts. Restart-fresh is acceptable for a local supervision surface and avoids a new store file.
- D-003 (2026-07-10): TipTap round-trip GO despite 5/334 historical files showing minor normalization drift (empty list items, trailing spaces in inline code, literal backticks in code spans). Mitigation: on entering edit mode the client round-trips the unedited body; if not byte-clean it shows a "formatting will be normalized on save" hint. Editing is never blocked; frontmatter is always byte-preserved.
- D-004 (2026-07-10): Watcher uses debounced rescan-on-signal (mtime sweep of indexed docs) rather than per-event path trust, because Windows coalesces bulk file operations into few directory-level events (probe T-002).
- D-006 (2026-07-10): T3 Code handover uses the standalone `t3code` CLI. The CLI resolves the Git root or exact folder, enforces `create|existing` project policy, creates a fresh T3 thread, starts the prompt through authenticated orchestration commands, cleans up a thread whose first turn fails, and then reveals the installed app. Delano passes prompts over stdin and does not interpolate them through a shell. Stable desktop T3 still cannot navigate to an externally supplied thread ID, so window reveal is accepted until the proposed `t3://thread/<id>` handler ships.

## Superseded Decisions
- D-005 (2026-07-10): The copy-prompt plus `t3code://app/` bridge was superseded after the scoped `t3 auth session issue` flow and orchestration HTTP endpoints were validated and wrapped in a standalone CLI.

## Open Decision Questions
- None recorded at creation.
