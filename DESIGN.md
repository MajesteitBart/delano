---
name: Delano Viewer
description: A quiet localhost document reader and navigator for delivery contracts.
assets:
  logo: "docs/images/delano-logo.svg"
  mark: "docs/images/delano-mark.svg"
  favicon: "docs/images/favicon.svg"
colors:
  document-bg: "oklch(0.985 0.004 85)"
  paper-surface: "oklch(0.995 0.003 85)"
  ink: "oklch(0.21 0.008 80)"
  ink-muted-70: "oklch(0.40 0.008 80)"
  ink-muted-50: "oklch(0.55 0.008 80)"
  ink-muted-40: "oklch(0.66 0.006 80)"
  ink-muted-25: "oklch(0.82 0.005 80)"
  hairline: "oklch(0.92 0.005 85)"
  hairline-soft: "oklch(0.95 0.005 85)"
  slate-accent: "oklch(0.52 0.08 245)"
  slate-accent-soft: "oklch(0.96 0.02 245)"
  brand-forest: "oklch(0.27 0.025 165)"
  brand-moss: "oklch(0.39 0.045 160)"
  brand-mint: "oklch(0.78 0.105 160)"
  success: "oklch(0.62 0.10 155)"
  success-soft: "oklch(0.96 0.03 155)"
  warning: "oklch(0.62 0.13 55)"
  warning-soft: "oklch(0.97 0.04 60)"
  low-signal: "oklch(0.70 0.04 85)"
  low-signal-soft: "oklch(0.96 0.01 85)"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.018em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  document:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "32px"
  page-x: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.document-bg}"
    rounded: "{rounded.sm}"
    padding: "6px 11px"
  button-secondary:
    backgroundColor: "{colors.document-bg}"
    textColor: "{colors.ink-muted-70}"
    rounded: "{rounded.sm}"
    padding: "6px 11px"
  nav-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.document-bg}"
    rounded: "{rounded.sm}"
    padding: "7px 9px"
  status-chip:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink-muted-70}"
    rounded: "{rounded.pill}"
    padding: "3px 9px 3px 7px"
  side-panel:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: Delano Viewer

## 1. Overview

**Creative North Star: The Local Dossier**

Delano is a localhost document reader for delivery contracts. The interface should feel like a precise local dossier: warm paper, clear indexes, compact annotations, and no performance of importance. The product is the contracts, not the chrome around them.

The brand mark brings an organic forest shape into an otherwise restrained operational surface. That mark should act like a stamp or source seal: present, recognizable, and quiet. The viewer itself remains document-like, flat, and deliberate.

**Physical scene.** A maintainer or coding agent operator is reading project state on a laptop or desktop during normal work, often inside an editor-adjacent workflow, where legibility and trust matter more than spectacle. This calls for a light, warm document theme with restrained contrast and visible provenance.

**Key characteristics:**
- Quiet, document-like, deliberate.
- Warm neutral paper surfaces with tinted ink, never pure black or pure white.
- Forest mark as identity, not decoration.
- Restrained slate accent used only for selected state and workflow signal.
- Flat hierarchy through borders, spacing, sticky navigation, and typography.
- Read-only product posture: provenance and source paths stay visible.

## 2. Logo Assets

Use the canonical asset set from `docs/images`.

- `delano-logo.svg`: primary horizontal lockup for documentation covers, README headers, and broad brand placements.
- `delano-mark.svg`: standalone mark for app chrome, compact sidebar identity, avatars, social previews, and generated package surfaces.
- `favicon.svg` and `favicon.png`: browser and package icon surfaces where a contained circular mark is required.
- PNG and JPG exports are fallback or preview assets. Prefer SVG in product UI and docs when the renderer supports it.

### Logo Rules

- Keep the horizontal lockup on warm paper or transparent backgrounds with enough quiet space around it.
- Use the standalone mark in the viewer sidebar when the wordmark would compete with navigation.
- Do not rebuild the wordmark in live text. The wordmark font is Red Hat Display in the supplied logo asset only.
- Do not use Red Hat Display anywhere else in the product or design system.
- Do not recolor the SVG paths unless producing a single-color accessibility or print variant.
- Do not place the mark inside decorative cards, gradient panels, or badge-heavy treatments.

### Clear Space

For the horizontal logo, reserve at least the height of the lowercase letter body around the lockup. For the standalone mark, reserve at least 20 percent of the mark width on every side. In the sidebar, the mark may sit inside the existing 26px control rhythm, but it should not be visually crowded by a border unless the surrounding component needs one.

## 3. Color

The product palette is restrained: warm document neutrals, one quiet slate accent, semantic status colors, and a forest identity layer reserved for brand assets.

### Canonical Product Tokens

- **Document Ground** (`document-bg`): app background and default button fill.
- **Paper Surface** (`paper-surface`): sidebar, panels, chips, table headers, code blocks.
- **Ledger Ink** (`ink`): main text, selected navigation, primary button surface, checked task boxes.
- **Muted Ink 70** (`ink-muted-70`): secondary text and default interactive labels.
- **Muted Ink 50** (`ink-muted-50`): metadata, timestamps, paths, helper text.
- **Muted Ink 40** (`ink-muted-40`): section labels, table headers, low-priority counters.
- **Muted Ink 25** (`ink-muted-25`): dotted links, separators, quiet hover borders.
- **Hairline** (`hairline`): structural 1px borders.
- **Soft Hairline** (`hairline-soft`): row dividers, hover fills, table rhythm.
- **Quiet Slate Accent** (`slate-accent`): active workflow signal, selected indicators, rare emphasis.
- **Slate Accent Soft** (`slate-accent-soft`): selected side-list rows and subtle active backgrounds.

### Brand Identity Tokens

- **Brand Forest** (`brand-forest`): deepest mark tone, for brand asset references and rare identity anchors.
- **Brand Moss** (`brand-moss`): mid mark tone, for controlled brand illustrations or print.
- **Brand Mint** (`brand-mint`): highlight tone from the mark, for brand previews and favicon glow only.

These identity tokens do not replace the product accent. The viewer uses slate for selection because it is calmer and more legible across dense contract surfaces. Forest and mint should appear mainly through the logo assets.

### Status Tokens

- **Verified Green** (`success`): completion and successful validation.
- **Verified Green Soft** (`success-soft`): success chip backgrounds.
- **Review Amber** (`warning`): blockers, warnings, incomplete health.
- **Review Amber Soft** (`warning-soft`): warning chip backgrounds.
- **Low Signal Taupe** (`low-signal`): planned, neutral, or low-risk signal.
- **Low Signal Soft** (`low-signal-soft`): low-signal chip backgrounds.

### Color Rules

**The Contract Ink Rule.** Text and source structure carry the interface. Color is evidence, state, selection, or brand presence, never ornament.

**The Two-Green Rule.** Product success green and brand forest green serve different jobs. Success green reports validation state. Brand forest identifies Delano. Do not use brand forest to mean success.

**The One Accent Rule.** Slate accent appears on less than 10 percent of a screen. If it is visible everywhere, it has lost its meaning.

**The Warm Paper Rule.** The viewer never uses pure white or pure black. All neutrals stay slightly warm and tinted.

## 4. Typography

**Display font:** Inter, with system sans fallbacks.

**Body font:** Inter, with system sans fallbacks.

**Mono font:** JetBrains Mono, with platform monospace fallbacks.

**Brand mark exception:** The supplied wordmark uses Red Hat Display. Treat that as part of the logo artwork, not a system font choice. Do not set Red Hat Display in CSS, markdown examples, interface labels, headings, buttons, or documentation body text.

Inter gives the viewer a neutral product cadence. JetBrains Mono is reserved for paths, timestamps, IDs, generated metadata, and code so operational details feel exact without overwhelming the reading surface.

### Hierarchy

- **Display**: 26px, 600, 1.15 line height, page titles and document titles only.
- **Headline**: 20px, 600, 1.15 line height, markdown h2 and major document headings.
- **Title**: 16px, 600, 1.3 line height, section headers, block titles, side-panel headings.
- **Body**: 14px, 400, 1.45 line height, product UI, tables, navigation, summaries, controls.
- **Document**: 15px, 400, 1.65 line height, markdown reader body. Keep prose around 65 to 75 characters per line when possible.
- **Label**: 11px, 500, uppercase, 0.08em letter spacing, field labels, table headers, section eyebrows.
- **Mono**: 12.5px, 400, path text, timestamps, generated metadata, source identifiers.

### Typography Rules

**The Reading Surface Rule.** Document body text gets more line height than product chrome. The UI is compact; the contract is comfortable.

**The Mono Evidence Rule.** Use monospace only where exact provenance matters. Do not use it as a decorative technology cue.

**The Asset Type Rule.** If the Delano name needs the Red Hat Display wordmark shape, use `delano-logo.svg`. If text needs to be selectable, searchable, or responsive, use Inter.

## 5. Layout

The core viewer shell uses a 232px desktop sidebar, sticky topbar, centered content with a 1320px max width, and document reader columns when metadata needs to stay visible.

- Desktop content padding: 36px top, 48px horizontal, 64px bottom.
- Main page rhythm: 36px vertical gaps between major blocks.
- Side panels: 12px to 14px internal padding, 6px radius, 1px hairline border.
- Summary strips: open ledger rows with top and bottom borders, not cards.
- Tables: grid rows with soft dividers and compact 13.5px body text.
- Mobile: collapse the sidebar into a wrapped top navigation band, remove the vertical border, and reduce content padding to 24px by 20px.

### Layout Rules

**The Ledger Row Rule.** When information is naturally tabular, use rows, dividers, and labels. Do not turn every item into a card.

**The Source Stays Visible Rule.** Paths, timestamps, read-only state, and generated-at metadata should remain visible near the content they describe.

**The Open Prose Rule.** Markdown prose should not be boxed unless it is code, frontmatter, a table, or a deliberately framed metadata block.

## 6. Elevation

The system is flat by design. Depth is conveyed through sticky placement, 1px hairline borders, tonal surface changes, and spacing. There are no decorative shadows.

The topbar may use a small backdrop blur only to preserve legibility while scrolling behind contract content. This is utility, not glass styling.

### Elevation Rules

**The Flat Ledger Rule.** Surfaces are separated by line, tone, and position. Shadows are prohibited unless a future interactive overlay genuinely needs spatial separation.

**The Blur Is Utility Rule.** Backdrop blur belongs only to sticky chrome that must remain readable over moving content.

## 7. Components

### Brand Lockup

Use SVG assets directly. The sidebar can use `delano-logo.svg` at roughly 110px wide when space allows. In compact contexts, use `delano-mark.svg` at 24px to 32px. Keep the mark optically aligned to the navigation rhythm rather than centered in a decorative container.

### Buttons

- Compact rectangular controls with 4px corners.
- Primary buttons use Ledger Ink background, Document Ground text, 1px ink border, and 6px by 11px padding.
- Secondary buttons use Document Ground, Hairline border, and Muted Ink 70 text.
- Hover shifts tone, border, and text color within 90ms.
- Focus should use an explicit outline, not glow.
- Disabled buttons keep the same structure and reduce contrast through muted ink and soft line tokens.

### Chips

- Pill shape, 1px border, 12px label, 6px status dot.
- Success, warning, and low-signal variants use soft tonal backgrounds with colored dots.
- Status must be readable by label and dot, not color alone.

### Navigation

Desktop navigation uses compact icon plus label rows with 7px by 9px padding, 4px radius, and 1px gaps. Active nav uses Ledger Ink background and Document Ground text. Counts sit in quiet pills and inherit active contrast when selected.

On mobile, navigation wraps horizontally in the top band. Preserve predictable order and do not invent gesture-only navigation.

### Document Reader

The markdown reader is the signature component. It preserves tables, code blocks, task lists, blockquotes, links, headings, and frontmatter while keeping document body prose narrower than the surrounding dashboard.

Code blocks and frontmatter may be framed. Prose remains open and readable.

### Summary Strip

Summary fields are not cards. They use top and bottom Hairline borders, internal vertical dividers, uppercase labels, and compact values. The first field aligns flush with page content to keep the strip feeling like a ledger row.

### Forms And Search

Search inputs use Paper Surface, Hairline border, 4px radius, 10px by 12px padding, and 14px Inter. Focus shifts the border toward Muted Ink 25 and the background toward Document Ground. Add inline state text and border changes before introducing modal errors.

## 8. Motion

Motion is functional and brief.

- Use 90ms for hover feedback in dense controls.
- Use 150ms to 250ms for state changes, reveal, and loading transitions.
- Use ease-out-quart, ease-out-quint, or similar exponential exit curves.
- Do not animate layout properties.
- Do not add decorative page-load sequences.

## 9. Do And Do Not

### Do

- Use OKLCH tokens from the viewer CSS as the canonical product palette.
- Prefer SVG logo assets from `docs/images`.
- Keep Red Hat Display confined to the supplied wordmark asset.
- Use Inter for display, headings, body, labels, and buttons.
- Preserve source paths, timestamps, generated-at labels, and read-only cues as visible provenance.
- Separate dense information with hairline borders and varied spacing instead of stacked cards.
- Make contracts comfortable to read: 15px document body, 1.65 line height, and max prose width around 65 to 75 characters.
- Use labels and dots together for status.

### Do Not

- Do not make Delano flashy, decorative, or marketing-led.
- Do not use generic SaaS dashboard tropes, hero metrics, promotional landing-page composition, or ornamental UI inside the product surface.
- Do not use playful mascot-driven agent tooling, heavy enterprise PM-suite density, or dark cyber-terminal styling.
- Do not add gradient text, decorative glassmorphism, colored side-stripe borders, or identical icon-card grids.
- Do not turn every repeated item into a card. Tables, lists, and summary strips are first-class structures.
- Do not use slate accent as decoration. It is for selection and workflow signal only.
- Do not use brand forest or mint as generic UI decoration.
