---
type: research_progress
project: 015-delano-viewer-annotations-agent-chat
slug: plannotator-agent-chat-integration
created: 2026-06-30T14:08:10Z
updated: 2026-06-30T14:22:00Z
---

# Progress: Plannotator-style annotations and agent chat integration

## 2026-06-30T14:08:10Z

- Opened research intake for project `015-delano-viewer-annotations-agent-chat`.
- Primary question: Which Plannotator annotation, export, and agent-chat patterns should Delano viewer adopt so .project markdown can be annotated, reviewed in a drawer, and submitted to Codex-backed chat without unsafe write behavior?

## 2026-06-30T14:22:00Z

- Inspected Plannotator package structure under `packages/` for annotation storage, drawer/export UX, sharing, AI chat, and Codex provider patterns.
- Inspected current Delano viewer server/client/test surfaces and confirmed the current app is intentionally read-only.
- Checked AI SDK Codex harness docs and Shadcn/Radix Message Scroller, Marker, Attachment, Bubble, and Message docs.
- Folded research into `spec.md`, `plan.md`, `decisions.md`, three workstreams, and seven executable tasks.

## Validation Evidence

- 2026-06-30T14:08:10Z: `node bin/delano.js research 015-delano-viewer-annotations-agent-chat plannotator-agent-chat-integration ... --json` passed built-in Delano validation after intake creation.
- Final validation is pending after fold-forward edits.

## Handoff Summary

- Research supports implementation, with T-001 as the first dependency-safe task.
- Recommended sequence: T-001 path-safe annotation store, T-002/T-003 drawer UX, T-004 Codex chat attachments, T-005 reviewed apply, T-006 optional sharing, T-007 docs.
- Do not implement hosted sharing or direct markdown mutation before the write-boundary tasks pass validation.
