---
id: WS-A
name: WS-A Annotation Data and Write Boundaries
owner: product
status: done
created: 2026-06-30T14:11:44Z
updated: 2026-06-30T14:56:09Z
operating_mode: uncertain-feature
---

# Workstream: WS-A Annotation Data and Write Boundaries

## Objective
Define the annotation persistence model and the narrow write API that lets the viewer store review feedback without turning the whole repository into an unrestricted browser-writable surface.

## Owned Files/Areas
- `.delano/viewer/server.js`
- Viewer server tests under `test/`
- Any future annotation storage helper introduced for viewer runtime use
- Project documentation that defines write boundaries, apply semantics, and rollback behavior

## Dependencies
- Current Delano viewer document index and file-serving APIs.
- Context-reader project contracts for repo context paths and agent handoff language.
- WS-B needs this workstream's annotation shape before the drawer can be reliable.
- WS-C needs this workstream's export shape before annotations can be sent to chat as attachments.

## Risks
- Path traversal, absolute path input, symlink escapes, or unsafe repo-relative normalization could expose files outside the approved project surface.
- Writing directly to canonical markdown from chat output would erase the current read-only safety property too early.
- Stale anchors and stale file hashes can make review feedback look applicable when the underlying file has changed.
- Annotation storage can become invisible project state if export, audit, and cleanup behavior are not explicit.

## Handoff Criteria
- Annotation JSON schema covers source path, anchor, selected quote, normalized fallback, comment, label/type, author, timestamps, and optional chat linkage.
- Server endpoints list, create, update, delete, and export annotations while rejecting unsafe paths and unknown `.project` documents.
- Apply design requires a preview diff, current file hash check, explicit user action, and rejection of non-`.project` targets.
- Tests exercise successful writes plus traversal, absolute path, stale baseline, malformed payload, and export edge cases.
