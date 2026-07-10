---
name: Viewer OpenKnowledge Parity
slug: viewer-openknowledge-parity
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

## Superseded Decisions
- None.

## Open Decision Questions
- None recorded at creation.
