---
id: T-013
name: Replace embedded chat with agent handover and redesign reader
status: done
workstream: WS-C
created: 2026-07-01T21:45:07Z
updated: 2026-07-01T22:40:47Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Replace embedded chat with agent handover and redesign reader

## Description

Owner review rejected the embedded chat direction as flimsy and cluttered. Replace it with agent handover as the primary review output, make annotation popovers sticky with click-to-edit highlights, and de-clutter the reader with a contents rail and per-document sidebar navigation.

## Acceptance Criteria
- [x] The `/api/ai/chat` endpoint, ChatPanel, chat tab, and AI SDK dependencies are removed from the server, UI, and package manifests.
- [x] `POST /api/handover` writes a deterministic handover file under `.project/viewer/handovers/` and returns a `codex://new` deep link plus launch/copy commands for `codex` and `claude`, rejecting unknown source paths.
- [x] The review panel's primary action is "Hand over to <agent>" with export demoted to the same menu.
- [x] An unsaved annotation popover never closes on outside clicks; clicking an existing highlight reopens it in edit mode with update and delete controls.
- [x] The reader shows a contents rail for document headings and the sidebar lists workstream and task documents directly.
- [x] Server tests cover the handover endpoint and the full suite passes.

## Traceability
- Story: US-003
- Acceptance criteria: AC-003

## Technical Notes

Handover launch uses `cmd /k` via `start` on Windows, Terminal via osascript on macOS, and common terminal emulators on Linux, with a copy-command fallback when no CLI or terminal is available. The handover prompt stays one line and references the handover file instead of inlining annotation content.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-01T22:40:47Z: Browser verification via Codex CLI passed end to end: sticky create popover, click-to-edit on highlights with the review panel open and closed, highlight persistence across panel toggles, and popover delete. Root causes fixed: repaints now restore pristine markup before re-anchoring (text-node fragmentation drifted anchors), highlight clicks moved to direct DOM delegation, and the review panel is a plain fixed panel because the vaul drawer blocked background pointer events while open.

- 2026-07-01T21:45:26Z: Removed /api/ai/chat, ChatPanel, and AI SDK deps. Added guarded POST /api/handover that writes .project/viewer/handovers/ files and returns codex/claude launch or copy commands. Popovers are sticky with click-to-edit highlights. Reader gained a contents rail and workstream/task sidebar navigation. Validation: ui build passes, npm test 100/100 including the new handover endpoint test, package manifest drift check passes.

- 2026-07-01T21:45:26Z: Owner review pivot: remove embedded chat, make agent handover the primary review output.
- 2026-07-01T21:45:07Z: Created from .project/templates/task.md by `delano task add`.
