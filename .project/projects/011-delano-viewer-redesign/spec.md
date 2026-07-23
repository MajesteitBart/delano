---
name: Delano Viewer Redesign
slug: 011-delano-viewer-redesign
owner: bart
status: complete
created: 2026-05-04T20:00:00Z
updated: 2026-06-09T21:24:22Z
outcome: The Delano viewer adopts the Keendoc design language with a sidebar-driven dashboard, Overview and Workstream Detail pages, and a document reader that preserves full markdown rendering.
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: Probe skipped: low-uncertainty redesign against an existing reference design language and a working viewer baseline.
operating_mode: scoped-change
---

# Spec: Delano Viewer Redesign

## Executive Summary

Replace the current tab-list-reader viewer layout with a sidebar-driven dashboard using the Keendoc design language exported from Claude Design. The redesign introduces three views: Overview (project dashboard), Workstream Detail (structured workstream page), and Document Reader (markdown viewer for individual contracts).

## Problem and Users

The current viewer works but uses a generic document-browser pattern (tabs, list, reader). The new design provides a purpose-built project dashboard that surfaces aggregated project state (current work, blockers, validation, progress, warnings) instead of requiring manual document-by-document browsing.

## Design Source

Design bundle exported from Claude Design (`claude.ai/design`). Key files:

- `ui_kits/viewer/index.html` — React entry point
- `ui_kits/viewer/app.jsx` — component source (Sidebar, Topbar, Overview, WorkstreamDetail, StatusChip, Field, SectionHeader, Block)
- `ui_kits/viewer/styles.css` — full stylesheet
- `colors_and_type.css` — design tokens (Inter + JetBrains Mono, oklch color system)

## Design Language

- **Type:** Inter (UI) + JetBrains Mono (paths, IDs, timestamps)
- **Palette:** Warm off-white surfaces, near-black ink, hairline cool-gray borders, single quiet slate-blue accent
- **Borders:** 1px hairline (`oklch(0.92 0.005 85)`), no shadows, no gradients
- **Status:** Dot+label chips (Planned / In Progress / Complete / Blocked)
- **Layout:** 232px sticky sidebar, sticky topbar with blur, max 1320px content
- **Voice:** Neutral, factual, no emoji, sentence case

## Acceptance Criteria

- [x] Viewer renders with Inter + JetBrains Mono fonts and oklch color tokens
- [x] Sidebar navigation replaces tab-based project switching
- [x] Overview page aggregates project state from .project contracts
- [x] Workstream detail page shows structured workstream info with two-column layout
- [x] Document reader preserves full markdown rendering capability (tables, code blocks, task lists, blockquotes)
- [x] Existing server.js API endpoints continue to work unchanged
- [x] Open in IDE and Open folder actions work from topbar
- [x] Non-project folders (context, templates) get a document list view

## Validation Evidence

Server tested at `http://127.0.0.1:3977` on 2026-05-04:

- `GET /` → 200, serves new React-based `index.html` with Inter/JetBrains Mono fonts
- `GET /app.jsx` → 200, `content-type: text/javascript; charset=utf-8`
- `GET /styles.css` → 200, `content-type: text/css; charset=utf-8`
- `GET /delano-mark.svg` → 200, `content-type: image/svg+xml; charset=utf-8`
- `GET /api/index` → 200, returns 13 projects with 197 docs, outline structures intact
- `GET /api/doc?path=projects/011-delano-viewer-redesign/spec.md` → 200, returns title, status, role, markdown, frontmatter
- All project outlines resolve workstreams, tasks, spec, plan correctly
- React app mounts with Babel standalone JSX transpilation (1381 lines, 29 components/functions)
- 2026-05-07: Dashboard sidebar items changed from Overview section jumps to dedicated dashboard pages. Browser smoke test at `http://127.0.0.1:3977` confirmed `Current Work` and `Warnings` render as separate page titles with active sidebar state; `/`, `/app.jsx`, and `/api/index` returned 200.
- 2026-05-08: Follow-up redesign changed the left sidebar from selected-project dashboard navigation to workspace-level navigation. Browser smoke test at `http://127.0.0.1:3977/` confirmed aggregate Open work, Progress, Validation, Warnings, and Blockers routes render with count badges; Progress shows 10 rows with `Page 1 of 4`; console reported 0 errors.
- 2026-05-11: WS-A closeout completed the remaining viewer UX tasks. Browser smoke test at `http://127.0.0.1:3978/` confirmed Projects dashboard fallback, persisted workspace route/page restore, shared pagination across workspace views, Overview workstream/open-task priority, workstream detail task de-duplication, and task-detail parent/sibling navigation; console reported 0 errors. Generated assets were rebuilt with `npm run build:assets`.
