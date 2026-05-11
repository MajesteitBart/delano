---
name: Delano Viewer
description: A quiet localhost document reader and navigator for delivery contracts.
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

**Creative North Star: "The Local Dossier"**

Delano Viewer should feel like a precise local dossier: quiet paper, clear indexes, restrained annotations, and no performance of importance. It is a localhost-only product UI where reading and navigating delivery contracts is the core job. The interface should disappear into the task, but never become vague.

The design language is document-like and deliberate. It uses warm near-white surfaces, near-black ink, hairline dividers, small status dots, and measured typography to make specs, plans, workstreams, tasks, and evidence easier to inspect. It rejects flashy, decorative, and marketing-led treatment. It also rejects generic SaaS dashboard tropes when they compete with the contracts themselves.

**Key Characteristics:**
- Quiet, document-like, deliberate.
- Warm neutral paper surfaces with tinted ink, never pure black or pure white.
- Restrained slate accent used only for selected state and workflow signal.
- Flat hierarchy through borders, spacing, sticky navigation, and typography.
- Read-only product posture: provenance and source paths stay visible.

## 2. Colors

The palette is a restrained warm document system with one quiet slate accent and semantic status colors.

### Primary
- **Ledger Ink** (`ink`): The main text, selected navigation background, primary button surface, and checked task boxes. Its weight carries authority without using pure black.
- **Quiet Slate Accent** (`slate-accent`): Used only for active workflow signal, selected indicators, and rare emphasis. It must not become decoration.

### Secondary
- **Verified Green** (`success`): Completion and success state only.
- **Review Amber** (`warning`): Blockers, warnings, and incomplete health only.
- **Low Signal Taupe** (`low-signal`): Planned, low-risk, and neutral status signal.

### Neutral
- **Document Ground** (`document-bg`): App background and default button fill.
- **Paper Surface** (`paper-surface`): Sidebar, side panels, chips, table headers, and markdown code blocks.
- **Muted Ink 70** (`ink-muted-70`): Secondary text and default interactive labels.
- **Muted Ink 50** (`ink-muted-50`): Metadata, timestamps, paths, and quiet helper text.
- **Muted Ink 40** (`ink-muted-40`): Section labels, table headers, and low-priority counters.
- **Muted Ink 25** (`ink-muted-25`): Dotted links, separators, and quiet hover borders.
- **Hairline** (`hairline`): Structural 1px borders.
- **Soft Hairline** (`hairline-soft`): Row dividers, hover fills, and table rhythm.

### Named Rules

**The Contract Ink Rule.** Text and source structure carry the interface. Color is evidence, state, or selection, never ornament.

**The One Accent Rule.** Slate accent appears on less than 10% of a screen. If it is visible everywhere, it has lost its meaning.

## 3. Typography

**Display Font:** Inter, with system sans fallbacks.
**Body Font:** Inter, with system sans fallbacks.
**Label/Mono Font:** JetBrains Mono, with platform monospace fallbacks.

**Character:** Inter gives the viewer a neutral product cadence. JetBrains Mono is reserved for paths, timestamps, IDs, generated-at metadata, and code so operational details feel exact without overwhelming the reading surface.

### Hierarchy
- **Display** (600, 26px, 1.15): Page titles and document titles only.
- **Headline** (600, 20px, 1.15): Markdown h2 and major document headings.
- **Title** (600, 16px, 1.3): Section headers, block titles, side-panel headings.
- **Body** (400, 14px, 1.45): Product UI, tables, navigation, summaries, controls.
- **Document** (400, 15px, 1.65): Markdown reader body. Keep prose around 65 to 75 characters per line when possible.
- **Label** (500, 11px, 0.08em, uppercase): Field labels, table headers, section eyebrows.
- **Mono** (400, 12.5px, -0.01em): Paths, timestamps, generated metadata, and source identifiers.

### Named Rules

**The Reading Surface Rule.** Document body text gets more line height than the product chrome. The UI is compact; the contract is comfortable.

**The Mono Evidence Rule.** Use monospace only where exact provenance matters. Do not use it as a decorative technology cue.

## 4. Elevation

The system is flat by design. Depth is conveyed through sticky placement, 1px hairline borders, tonal surface changes, and spacing. There are no decorative shadows. The topbar uses a small backdrop blur only to preserve legibility while scrolling behind contract content.

### Named Rules

**The Flat Ledger Rule.** Surfaces are separated by line, tone, and position. Shadows are prohibited unless a future interactive overlay genuinely needs spatial separation.

**The Blur Is Utility Rule.** Backdrop blur belongs only to sticky chrome that must remain readable over moving content. It is not a glass effect.

## 5. Components

### Buttons
- **Shape:** Compact rectangular controls with small corners (4px).
- **Primary:** Ledger Ink background with Document Ground text, 1px ink border, and 6px by 11px padding.
- **Hover / Focus:** Hover shifts tone, border, and text color within 90ms. Focus should use an explicit outline if added, not glow.
- **Secondary / Ghost / Tertiary:** Secondary buttons use Document Ground, Hairline border, and Muted Ink 70 text. Icon plus text is appropriate for IDE, folder, and source actions.

### Chips
- **Style:** Pill shape (999px), 1px border, 12px label, 6px status dot.
- **State:** Success, warning, and low-signal variants use soft tonal backgrounds with colored dots. Status must be readable by label and dot, not color alone.

### Cards / Containers
- **Corner Style:** Side panels use a restrained 6px radius. Repeated table rows and summary strips stay uncarded.
- **Background:** Paper Surface for side panels and code blocks, Document Ground for the page.
- **Shadow Strategy:** No shadow vocabulary. Borders and tonal layers do the work.
- **Border:** Hairline border at 1px. Row separators use Soft Hairline.
- **Internal Padding:** Side panels use 12px to 14px. Page content uses larger rhythm: 36px vertical section gaps and 48px desktop horizontal padding.

### Inputs / Fields
- **Style:** Search inputs use Paper Surface, Hairline border, 4px radius, 10px by 12px padding, and 14px Inter.
- **Focus:** Border shifts toward Muted Ink 25 and background shifts to Document Ground.
- **Error / Disabled:** No dedicated pattern exists yet. Add inline state text and border changes before introducing modal errors.

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.** The desktop shell uses a 232px sticky sidebar and sticky topbar. Navigation items are 14px Inter, 7px by 9px padding, 4px radius, icon plus label, and 1px gaps. Active nav uses Ledger Ink background and Document Ground text. Mobile collapses the sidebar into a wrapped top navigation band and removes the vertical border.

### Document Reader

The markdown reader is the signature component. It preserves tables, code blocks, task lists, blockquotes, links, headings, and frontmatter while keeping the document body narrower than the surrounding dashboard. Code blocks and frontmatter may be framed; prose should remain open and readable.

### Summary Strip

Summary fields are not cards. They use top and bottom Hairline borders, internal vertical dividers, uppercase labels, and compact values. The first field aligns flush with page content to keep the strip feeling like a ledger row.

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH tokens from the viewer CSS as the canonical palette.
- **Do** keep the default color strategy restrained: warm neutrals, one slate accent, and semantic status colors.
- **Do** preserve source paths, timestamps, generated-at labels, and read-only cues as visible provenance.
- **Do** separate dense information with hairline borders and varied spacing instead of stacked cards.
- **Do** make contracts comfortable to read: 15px document body, 1.65 line height, and max prose width around 65 to 75 characters.
- **Do** use labels and dots together for status.

### Don't:
- **Don't** make Delano flashy, decorative, or marketing-led.
- **Don't** use generic SaaS dashboard tropes, hero metrics, promotional landing-page composition, or ornamental UI inside the product surface.
- **Don't** use playful mascot-driven agent tooling, heavy enterprise PM-suite density, or dark cyber-terminal styling.
- **Don't** add gradient text, decorative glassmorphism, colored side-stripe borders, or identical icon-card grids.
- **Don't** turn every repeated item into a card. Tables, lists, and summary strips are first-class structures.
- **Don't** use the slate accent as decoration. It is for selection and workflow signal only.
