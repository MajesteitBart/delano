---
id: WS-A
name: WS-A Portable core plugin
owner: bart
status: done
created: 2026-09-12T19:48:22Z
updated: 2026-09-13T13:04:38Z
operating_mode: feature
---

# Workstream: WS-A Portable core plugin

## Objective

Ship the ten-workflow portable plugin with reproducible package contents.

## Owned Files/Areas

plugins/delano/, scripts/build-agent-plugin.mjs, test/agent-plugin.test.js, package scripts, plugin docs, and the source completion-summary template.

## Dependencies

Existing contract templates and official portable plugin specification.

## Risks

Package links escaping into the source checkout; compatibility metadata drift; unsupported claims about workflow verification.

## Handoff Criteria

All ten skills and manifests validate, relocation and distribution checks pass, and evidence distinguishes local validation from host installation.
