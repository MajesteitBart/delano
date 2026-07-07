---
id: T-011
name: Decide responsive annotation chat placement
status: done
workstream: WS-D
created: 2026-06-30T22:21:11Z
updated: 2026-06-30T22:58:52Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-010]
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: uncertain-feature
story_id: 
acceptance_criteria_ids: []
---

# Task: Decide responsive annotation chat placement

## Description

Evaluate whether annotation chat belongs in the right sidebar, a stacked column under the annotation drawer, a collapsible drawer, or a Sheet on tablet, then implement the chosen placement with clear scroll ownership.

## Acceptance Criteria

- [x] A placement decision records desktop and tablet behavior, including why sidebar, column, or drawer was chosen.
- [x] Annotation list, chat transcript, and metadata do not create confusing nested scroll regions at tablet width.
- [x] Keyboard focus and screen-reader labels remain valid for the selected placement.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Candidate placements:
  - Desktop right sidebar: annotation drawer above chat, metadata below or collapsible.
  - Desktop split column: annotations and chat as sibling panes beside the document.
  - Drawer/sheet: chat opens from the annotation rail, especially on tablet.
- The decision should be driven by scroll ownership and review flow, not decoration: reviewers need to keep document context, selected annotations, and the active streamed answer visible without squeezing markdown.
- Tablet acceptance should explicitly cover the earlier failure mode where the document column became too narrow.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [ ] Review complete
- [x] Docs updated

## Placement Decision

Use one focused review rail for annotation chat in WS-D.

- Desktop and tablet rail (`>960px`): `DocumentReaderPage` uses a two-column `.doc-layout`: the markdown article stays in the main column and the right `.doc-aside` contains one `AnnotationDrawer` card. The review card is a shadcn/Radix `Tabs` surface with `Annotations`, `Chat`, and `Details`, so annotation list, streamed chat, and metadata are alternate review modes instead of stacked cards.
- Narrow desktop/tablet (`<=1280px` and `>960px`): the app sidebar collapses, but the document still keeps a 320px review rail. Browser evidence at 1080x1800 measured a 692px document column, 320px review rail, 56px topbar, one aside card, and no horizontal overflow.
- Mobile (`<=960px`): `.doc-layout` becomes one column, but the review surface remains a tabbed card. This avoids the failed full-width mega-card where annotations, chat, and metadata all appeared vertically in sequence.
- Chat scroll ownership stays inside shadcn `MessageScroller`; the tab panel owns only mode switching and the page owns overall traversal.

Rejected alternatives:

- Separate chat drawer/sheet: adds another disclosure surface and another scroll layer while reviewers already need a review rail visible.
- Split annotations and chat into sibling panes: increases horizontal pressure and can recreate the tablet squeeze.
- Full-width stacked annotation/chat/metadata cards at tablet: rejected after visual testing because it creates a giant bottom panel with excessive whitespace and unclear scroll ownership.
- Floating chat launcher: hides attachment state and makes it harder to verify which annotations were submitted.

Focus and accessibility notes:

- Chat input remains a normal form inside the `Chat` tab.
- `MessageScrollerButton` keeps its screen-reader label from the shadcn component.
- Empty state uses `Marker`, and selected annotation attachments use `Attachment`, preserving named, focusable controls around the send button.

## Evidence Log

- 2026-06-30T22:58:52Z: Recorded responsive placement decision: chat stays in the annotation review column; desktop uses the right aside, tablet/mobile stack the aside below the document, and MessageScroller owns only transcript scrolling.

- 2026-06-30T22:57:27Z: Recording side-column placement decision and scroll ownership for annotation chat.
- 2026-07-01T00:29:00Z: Placement decision recorded: keep chat inside the annotation review column; desktop uses the right review column, tablet/mobile stack the aside under the document, and `MessageScroller` owns only transcript scrolling.
- 2026-07-01T00:29:00Z: Source inspection: `.doc-layout` is two-column above 1280px and one-column below 1280px; `.doc-aside` is sticky/scrolling on desktop and static/visible on tablet.
- 2026-07-01T01:19:32Z: Revised placement after Claude visual critique and browser evidence: use one shadcn `Tabs` review rail (`Annotations`, `Chat`, `Details`), keep a 320px rail at 1080px, collapse only below 960px, and remove stacked annotation/chat/metadata cards.
- 2026-06-30T22:21:11Z: Created from .project/templates/task.md by `delano task add`.
