---
name: WS-A Viewer Runtime and Index API
owner: bart
status: done
created: 2026-04-28T20:40:49Z
updated: 2026-04-28T21:57:54Z
---

# Workstream: WS-A Viewer Runtime and Index API

## Objective

Provide the local read-only server, markdown indexing, document APIs, project outline data, and guarded open actions needed by the viewer frontend.

## Owned Files/Areas

- `.delano/viewer/server.js`
- `.delano/viewer/README.md`
- `package.json`
- API smoke checks for `/api/index`, `/api/doc`, and `/api/open`

## Dependencies

- Existing `.project` folder layout.
- Node.js 18 or newer.
- Local system opener and optional VS Code CLI for open actions.

## Risks

- Path handling bugs could expose files outside `.project`.
- Inferred roles and relationships could drift from Delano contract conventions.
- Open actions could be misunderstood as viewer editing support if not documented clearly.

## Handoff Criteria

- Server starts through `npm run viewer`.
- `/api/index` and `/api/doc` return the expected read-only metadata and markdown content.
- Open actions are constrained to markdown files inside `.project`.
- Syntax checks, tests, and API smoke evidence are captured.
