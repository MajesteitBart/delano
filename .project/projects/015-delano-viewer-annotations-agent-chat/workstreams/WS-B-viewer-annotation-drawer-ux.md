---
id: WS-B
name: WS-B Viewer Annotation Drawer UX
owner: product
status: done
created: 2026-06-30T14:11:44Z
updated: 2026-06-30T14:55:39Z
operating_mode: uncertain-feature
---

# Workstream: WS-B Viewer Annotation Drawer UX

## Objective
Make the Delano viewer annotation-aware: users can select text in rendered markdown, create feedback, see durable markers in the document, and manage all annotations from a drawer that keeps the document readable across desktop and tablet widths.

## Owned Files/Areas
- `.delano/viewer/public/app.jsx`
- `.delano/viewer/public/styles.css`
- Viewer browser smoke tests or visual evidence added for the annotation workflow
- UI copy and local equivalents for Shadcn/Radix Marker, Attachment, Bubble, Message, and MessageScroller patterns where the existing viewer stack cannot consume them directly

## Dependencies
- WS-A annotation schema and write endpoints.
- Current viewer layout constraints, including prior tablet-width content readability issues.
- Markdown rendering internals currently built around `dangerouslySetInnerHTML`; stable anchors may require a renderer refactor before annotation tools are added.

## Risks
- Highlighting raw rendered HTML can produce brittle offsets if markdown changes or if code/table blocks are treated like normal paragraphs.
- The drawer can repeat the earlier side-panel failure mode by taking too much horizontal space at tablet sizes.
- Selection toolbar controls can overlap document text or become inaccessible in scroll containers.
- Quick-label icons and comment actions need keyboard and screen-reader behavior, not only mouse interactions.

## Handoff Criteria
- Selecting text opens a compact annotation toolbar and creates a draft with quote plus block/line context.
- Reloaded documents restore highlights when anchors still match and mark stale entries clearly when they do not.
- Drawer lists, filters, selects, edits, deletes, and exports annotations with deterministic ordering and visible counts.
- Desktop and tablet screenshots or smoke tests show the document remains readable while the drawer is open.
