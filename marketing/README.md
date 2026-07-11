# Delano marketing site

A single-file landing page for Delano, built to the paper-and-ink editorial design system (warm paper canvas, near-monochrome ink, pill controls, the golden-coral-plum gradient reserved for screenshot stages and the closing card).

Live artifact: <https://share.bvdm.ai/mtq9zyoh> (encrypted; the full link with the decryption key is required to view).

## Layout

- `index.html` — the page source. References fonts and images by relative path.
- `build.mjs` — inlines the fonts (base64 woff2), the SVG mockups (inline `<svg>`), and the PNG screenshots (data URIs) into a fully self-contained `delano-pub.html`. That built file is generated output and is not committed.
- `svg/` — hand-drawn mockups in the site's ink palette:
  - `hero-viewer.svg` — the viewer with a spec open (hero frame).
  - `spec-probe.svg` — a spec file with the probe decision in its frontmatter (Model section).
  - `callout-enforced.svg` — the `[enforced]` validation mini-card (Evidence section callout).
- `real/` — real product screenshots captured from the live viewer:
  - `task-detail-crop.png` — the task detail page: title first, collapsible detail cards, checked acceptance criteria.
  - `annotation-frame.png` — the full viewer with a highlight and the annotation popover open.
  - `handover-menu.png` — the Send-to agent menu (crop of a real capture).
- `fonts/` — Inter and JetBrains Mono variable fonts (OFL licensed), embedded at build time.

The agent logos in the logo bar are inlined in `index.html` and use the same SVG paths as the viewer's `AgentLogo` component, so the marks match the product screenshots exactly.

## Build

```bash
node marketing/build.mjs
```

Writes `marketing/delano-pub.html`, self-contained (no network requests except outbound GitHub/npm links, which open in new tabs because the share page hosts the artifact in an iframe).

## Publish

Published with the `share-html-artifact` skill (Share Note server, encrypted artifact mode):

```bash
share-artifact update "<existing share URL with key>" marketing/delano-pub.html \
  --title "Delano: Your agent says it's done. Prove it." --json
```

Use `update` with the existing URL to keep the same link; `publish` mints a new one.

## Regenerating screenshots

Start the viewer (`npm run viewer`) and capture with Playwright against `127.0.0.1:<port>` at `deviceScaleFactor: 2`. The real captures in `real/` come from the "Viewer Annotations and Agent Handover" project: task `T-013` for the task detail, and the spec's Out of Scope section for the annotation popover (select a sentence, dispatch `mouseup`, type the comment with spellcheck disabled).
