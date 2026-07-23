---
id: WS-C
name: WS-C Viewer And Agent Integration
owner: frontend
status: done
created: 2026-06-24T21:51:46Z
updated: 2026-06-25T10:35:29Z
---

# Workstream: WS-C Viewer And Agent Integration

## Objective

Make viewer/server and future agent-button flows consume the shared context reader where useful, without turning context support into a broad UI expansion.

## Owned Files/Areas

- `.delano/viewer/server.js`
- `.delano/viewer/public/app.jsx`
- agent-button prompt/template code if implemented in parallel or later
- docs that explain context profiles for agents

## Dependencies

- WS-B shared context reader and CLI behavior.

## Risks

- Viewer already indexes context files; integration could duplicate behavior instead of simplifying it.
- Agent-button prompts could become too long if they embed context content rather than references.
- UI work could distract from the core context-reader contract.

## Handoff Criteria

- Any viewer/server integration calls the shared reader/helper rather than reimplementing discovery.
- Agent-button prompts reference context commands/profiles instead of dumping full context by default.
- Existing context document browsing continues to work.
- Viewer remains read-only.
