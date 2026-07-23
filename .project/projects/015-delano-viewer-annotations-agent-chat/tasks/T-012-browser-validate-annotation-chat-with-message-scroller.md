---
id: T-012
name: Browser-validate annotation chat with message scroller
status: done
workstream: WS-D
created: 2026-06-30T22:21:21Z
updated: 2026-06-30T23:11:38Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-009, T-010, T-011]
conflicts_with: []
parallel: true
priority: high
estimate: M
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Browser-validate annotation chat with message scroller

## Description

Use the browser or Chrome control path to prove that selected annotations can be sent through the AI SDK-backed message-scroller chat and that streaming, anchoring, attachments, fallback, and responsive placement work.

## Acceptance Criteria

- [x] Browser smoke creates a temporary annotation, sends it through chat as an attachment, observes a streamed assistant response in MessageScroller, and deletes the annotation afterward.
- [x] Desktop and tablet screenshots or equivalent browser evidence show readable content, reachable annotations, and stable chat placement without horizontal overflow.
- [x] Validation evidence is recorded in the task or update log after implementation.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Browser validation should prove behavior, not component appearance only:
  - inspect that shadcn message primitives are in the rendered tree;
  - create and send a temporary selected-text annotation;
  - observe streamed assistant output in `MessageScroller`;
  - verify `MessageScrollerButton`/anchoring behavior when content exceeds the viewport;
  - delete the temporary annotation and confirm storage returns clean.
- Capture both desktop and tablet evidence because chat placement is the main unresolved UX decision.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-06-30T23:11:38Z: Browser validation passed: temporary guarded annotation appeared in drawer, sent through visible chat as an attachment, AI SDK/shadcn message scroller rendered streamed fallback response, tablet DOM evidence showed stacked no-overflow layout, and cleanup returned annotations to empty.

- 2026-06-30T22:59:02Z: Browser-validating annotation chat, shadcn MessageScroller behavior, and responsive placement.
- 2026-07-01T00:44:00Z: In-app browser opened packaged viewer at `http://127.0.0.1:3980/` from the current branch. Desktop evidence showed two-column document/review layout, annotation highlight, chat response text, and annotation attachment.
- 2026-07-01T00:44:00Z: Browser automation could not trigger native text selection reliably, so the temporary annotation was created through the guarded `/api/annotations` endpoint with ID `747d9f30-63e6-4a9c-8cc1-511b6e1e14a0`; the browser then verified the drawer displayed the annotation and chat reported `1 attachment`.
- 2026-07-01T00:44:00Z: Browser chat send used the visible chat textarea and Send button. DOM evidence after streaming: `messageCount=2`, `bubbleCount=2`, `attachmentCount=1`, `scrollerItemCount=2`, fallback text included `I received 1 annotation attachment`, disabled-Codex messaging, and `No files were written`.
- 2026-07-01T00:44:00Z: Tablet viewport DOM evidence: `asideBelowMain=true`, `horizontalOverflow=false`, `messageScroller=true`, `messageScrollerHeight=288`, `messageCount=2`, `attachmentCount=1`. The in-app screenshot API returned a blank frame at the scrolled tablet chat position, so DOM evidence was used for the tablet acceptance check.
- 2026-07-01T00:44:00Z: Cleanup deleted the temporary annotation through `/api/annotations`; reload verified `hasTemporaryAnnotation=false`, drawer text returned to `Annotations 0`, and `.project/viewer/annotations.json` contained an empty `annotations` array.
- 2026-07-01T01:19:32Z: Revalidated after visual correction: 1080x1800 browser evidence showed a 692px document column, 320px tabbed review rail, 56px topbar, one aside card, no horizontal overflow, working `Annotations`/`Chat`/`Details` tabs, and a shadcn `MessageScroller` measuring 296x192 in the chat tab.
- 2026-07-01T01:19:32Z: Screenshot evidence captured at `.project/viewer/screenshots/tablet-review-annotations-tab-1080.png`, `.project/viewer/screenshots/tablet-review-chat-tab-1080.png`, `.project/viewer/screenshots/tablet-review-details-tab-1080.png`, and `.project/viewer/screenshots/desktop-review-tabs-1760.png`.
- 2026-06-30T22:21:21Z: Created from .project/templates/task.md by `delano task add`.
