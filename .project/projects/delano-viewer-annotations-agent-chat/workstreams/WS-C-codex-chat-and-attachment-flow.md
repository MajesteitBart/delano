---
id: WS-C
name: WS-C Codex Chat and Attachment Flow
owner: product
status: done
created: 2026-06-30T14:11:44Z
updated: 2026-07-01T23:22:07Z
operating_mode: uncertain-feature
---

# Workstream: WS-C Codex Chat and Attachment Flow

## Objective
Connect viewer annotations to an agent-facing chat flow so selected feedback can be submitted as structured attachments to a Codex-backed AI session, while keeping hosted sharing and file mutation opt-in and reviewable.

Scope note (2026-07-01): owner review replaced the embedded chat flow with agent handover; T-013 closed this workstream's surface with handover files, a `codex://new` deep link, and terminal launch/copy commands. See decisions.md.

## Owned Files/Areas
- Viewer chat server endpoint and client panel once implemented
- Package dependency changes for AI SDK stream support and compatible chat UI primitives
- Documentation for chat attachment format, Codex context instructions, and optional sharing behavior
- Tests or smoke coverage for streaming chat, attachment payload construction, and disabled/missing credentials states

## Dependencies
- WS-A export payload and safe write boundaries.
- WS-B drawer selection and export surface.
- Codex CLI behavior, subscription-auth requirements, and AI SDK stream contract.
- Shadcn/Radix chat component contracts for MessageScroller, Attachment, Bubble, Message, and Marker.

## Risks
- Codex CLI sessions need explicit auth, read-only sandboxing, timeout/cancellation behavior, and error states before they are safe inside a local viewer.
- Streaming chat can become visually unstable unless message scrolling honors user scroll position.
- Annotation attachments may leak too much repo context if payload construction is not deliberately scoped.
- Cloudflare-style sharing has privacy, retention, payload-size, and offline behavior questions that must be answered before becoming a default path.

## Handoff Criteria
- Chat submission includes selected annotations as attachments with source path, quote, anchor, comment, and context-reader profile hints.
- Streaming UI uses message-scroller behavior so new tokens follow the live edge only when the user is already at the bottom.
- Initial Codex mode is read-oriented by default; any file application remains behind preview and explicit apply controls from WS-A.
- Optional sharing is either documented as deferred or implemented behind a clear opt-in switch with local export as the fallback.
