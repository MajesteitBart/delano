---
id: T-008
name: Design polish for clean balanced viewer
status: done
workstream: WS-C
created: 2026-04-28T20:55:21Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004]
conflicts_with: []
parallel: true
priority: medium
estimate: M
---

# Task: Design polish for clean balanced viewer

## Description

Apply a final visual design polish pass so the viewer feels clean, balanced, and minimally distracting after design input is received.

## Acceptance Criteria
- [x] Design input is received and summarized in the task evidence.
- [x] Sidebar, list, reader, and outline proportions feel balanced on desktop.
- [x] Narrow viewport layout remains readable without overlap or awkward wrapping.
- [x] Typography, spacing, badges, cards, and controls align to the agreed visual direction.
- [x] Browser screenshots are captured after the polish pass.

## Technical Notes

- This task is intentionally blocked until design input is provided.
- Keep the viewer utilitarian and operator-focused; avoid turning it into a marketing-style page.
- Reuse existing visual structure unless the design input clearly requires a larger adjustment.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Task created from WS-C scope expansion. Blocked on design input to be received.
- 2026-04-28: Design input received through the `minimalist-ui` skill: warm monochrome palette, editorial typography, crisp borders, flat cards, muted pastel status tags, minimal shadows, no gradients, and quiet reveal motion.
- 2026-04-28: Redesigned `.delano/viewer/public/styles.css`, `.delano/viewer/public/app.js`, and `.delano/viewer/public/index.html` around the minimalist-ui direction.
- 2026-04-28: Follow-up visual review found the first pass too oversized and cramped. Adjusted reader heading scale, wide/normal desktop breakpoints, metadata chip width, outline progress grouping, and duplicate workstream labels.
- 2026-04-28: Follow-up feedback identified the breakpoint-only outline hiding as the wrong tradeoff. Added an explicit `Show outline` / `Hide outline` toggle so the reader stays spacious by default while the outline remains available on any screen.
- 2026-04-28: Follow-up feedback identified reader action buttons competing with the document title. Moved open actions below the title metadata so the title has the full reader column.
- 2026-04-28: Captured visual evidence at `output/playwright/viewer-minimalist-1260.png`, `output/playwright/viewer-minimalist-wide.png`, and `output/playwright/viewer-minimalist-mobile.png`.
- 2026-04-28: `node --check .delano/viewer/public/app.js`, `node --check .delano/viewer/server.js`, and `npm test` passed; browser console reported zero errors.
