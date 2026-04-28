---
id: T-009
name: Copy-to-clipboard buttons for valuable fields and values
status: done
workstream: WS-C
created: 2026-04-28T21:30:00Z
updated: 2026-04-28T22:04:22Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004]
conflicts_with: []
parallel: true
priority: medium
estimate: S
---

# Task: Copy-to-clipboard buttons for valuable fields and values

## Description

Operators frequently copy fields and values out of the viewer to paste into AI agent chats (paths, task IDs, dependency lists, code blocks, full markdown bodies). Add small, unobtrusive copy-icon buttons next to the values that are most valuable to lift verbatim, so an operator can grab the exact string in one click.

The feature must keep the viewer read-only and keep the visual language consistent with the minimalist UI direction (no heavy chrome, no emojis, neutral tones, single-stroke icon, ultra-subtle hover state).

## Acceptance Criteria
- [x] A copy-icon button appears next to the document path in the reader meta row.
- [x] A copy-icon button appears next to each frontmatter value in the properties grid (skips empty values).
- [x] A copy-icon button appears in the top-right of every fenced code block in the rendered markdown.
- [x] A "Copy markdown" action is available alongside the existing reader actions and copies the document body verbatim.
- [x] Clicking a copy button writes the value to the clipboard via the async Clipboard API and falls back to a hidden textarea + `execCommand('copy')` when the API is unavailable (e.g., older WebViews, file://).
- [x] After a successful copy the button shows a brief, accessible "Copied" confirmation (visual + `aria-live`) for ~1.4s and then returns to its idle state.
- [x] The buttons are keyboard reachable, have a discoverable focus ring, and carry meaningful `aria-label` text describing what they copy.
- [x] Copy interactions never trigger navigation, document switch, outline toggle, or other side effects.

## Technical Notes

- Render copy buttons as small bordered square icon buttons (`width: 22-26px`) using a clean two-rectangle copy glyph drawn as inline SVG; do not pull in a runtime icon library. Stroke width must match the rest of the viewer's visual weight.
- Use `navigator.clipboard.writeText` first; fall back to a hidden textarea selection + `document.execCommand('copy')` for browsers/contexts that do not expose the async API.
- Code-block copy buttons must position over the `<pre>` block without breaking horizontal scrolling; use `position: relative` on the `<pre>` and absolute-positioned button anchored top-right with appropriate inset.
- The copy-feedback state must be local to the clicked button, so multiple copies do not interfere; either toggle a class with a timeout or store transient state on the element itself.
- Event delegation should route through a single `data-copy` attribute so the existing `render()` pipeline does not need per-button handlers.
- Keep the hover/focus state within the protocol's "ultra-subtle" range: a 1px border tone shift and a subtle background, no scale or translate.
- Do not animate or shift the surrounding layout when the confirmation appears (use a fixed-width label or absolute-positioned tooltip).

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Task created to capture an operator workflow gap: valuable fields (paths, IDs, code blocks, markdown bodies) had to be selected manually before copying into AI agent chats.
- 2026-04-28: Implemented `.delano/viewer/public/app.js` with a small copy registry, `copyButton(value, label, extraClass)` helper, async-clipboard-with-fallback, and a single delegated capture-phase click handler attached once at init. Registry is cleared at the start of each `render()` to keep id space tight.
- 2026-04-28: Wired copy buttons next to the reader path-pill, beside every frontmatter property value (empty values skipped), inside every fenced code block (visible on `<pre>` hover/focus), and as a "Copy markdown" reader action that copies the entire document body.
- 2026-04-28: Added `.copy-btn`, `.copy-btn.pre-copy`, `.copy-btn.copied`, and `.action.copied` styling in `.delano/viewer/public/styles.css`; added a polite `#copy-live` region in `.delano/viewer/public/index.html`.
- 2026-04-28: `node --check` on `app.js` and `server.js` passed; `npm test` passed (11/11); HTTP smoke confirmed `/api/index` returns 5 projects, 74 docs, including the new viewer-markdown-samples context doc.
- 2026-04-28: Marked done after operator confirmation.
