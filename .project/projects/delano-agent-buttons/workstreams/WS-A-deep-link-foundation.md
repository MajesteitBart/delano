---
id: WS-A
name: WS-A Deep Link Foundation
owner: platform
status: planned
created: 2026-06-17T12:37:58Z
updated: 2026-06-17T14:02:00Z
---

# Workstream: WS-A Deep Link Foundation

## Objective
Create the server-side technical foundation for safe local deeplinks into Codex and Claude Code from the Delano viewer.

## Owned Files/Areas
- `.delano/viewer/server.js`
- `.delano/viewer/public/app.jsx`
- Any new viewer helper module or test fixture for prompt/link generation

## Dependencies
- Official Codex `codex://threads/new` behavior.
- Official Claude Code `claude-cli://open` behavior.
- Absolute local repo path from the viewer server.

## Risks
- Accidentally exposing local absolute paths beyond local clickable links.
- Overloading client-side code with server-only repo context.
- Treating links as command execution rather than prompt prefill.
- Adding absolute repo root to `/api/index` instead of a narrow action endpoint.
- Logging absolute-path provider URLs through normal server/client diagnostics.

## Handoff Criteria
- Codex and Claude Code URL builders are deterministic and tested.
- Builders run server-side from a constrained action context.
- Returned payload includes `provider`, `url`, `prompt`, and `warnings`.
- Unknown providers/actions and invalid `.project` relative paths fail closed.
- Missing context fails into a safe explanation/copy-prompt fallback.
- No direct `.project` writes are introduced.
