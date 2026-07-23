---
name: Viewer Refactor Loopfile
slug: delano-viewer-refactor-loopfile
project: 015-delano-viewer-annotations-agent-chat
owner: product
status: active
created: 2026-06-30T18:12:52Z
updated: 2026-07-06T11:15:06Z
loop_type: visual-refactor
validation: npm --prefix .delano/viewer/ui run build; npm run build:assets; npm run check:package-manifest; npm test; node bin/delano.js validate -- --release
---

# Loopfile: Viewer Shadcn and Domain Refactor

## Purpose

Use this loopfile to carry the viewer refactor forward without losing the architecture plan or the visual review discipline. The viewer should keep the current guarded local-server API shape while the frontend becomes easier to test, evolve, and review.

## Current State

- The old `.delano/viewer/public/app.jsx`, `.delano/viewer/public/app.js`, and `.delano/viewer/public/styles.css` static source path has been replaced on this branch.
- The active viewer source is `.delano/viewer/ui/src/App.tsx`.
- Real shadcn/Radix components are installed under `.delano/viewer/ui/src/components/ui`.
- The shipped runtime is built into `.delano/viewer/public/assets/viewer.js` and `.delano/viewer/public/assets/index.css`.
- `.delano/viewer/server.js` remains the stable local HTTP server and API boundary.
- The package should keep shipping built static assets rather than the Vite source app.

## Stored Plan

Treat the next refactor as a two-track cleanup:

1. Split the viewer into clean domain, markdown, app-hook, component, and page layers.
2. Keep replacing hand-rolled primitives and layout behavior with shadcn/Radix-backed components where the current surface still has custom equivalents.

The original architectural catch still matters: shadcn/ui is not a script-tag dependency. It assumes source components, Tailwind tokens, aliases, and a build step. Delano should keep the current Path B model:

- source app in `.delano/viewer/ui`;
- built assets in `.delano/viewer/public`;
- package payload staged through `npm run build:assets`;
- server APIs unchanged unless the task explicitly touches the write/chat/read endpoints.

## Target Structure

```txt
.delano/viewer/
  server.js
  ui/
    src/
      main.tsx
      app/
        App.tsx
        routes.tsx
        useViewerIndex.ts
        useViewerNavigation.ts
        useViewport.ts
        useDocument.ts
      lib/
        markdown/
          renderMarkdown.ts
          markdownBlocks.ts
        domain/
          status.ts
          workspace-model.ts
          navigation.ts
          dates.ts
          pagination.ts
          clipboard.ts
          handover.ts
        utils.ts
      components/
        ui/
          ...
        atoms/
          StatusBadge.tsx
          CountBadge.tsx
          CopyButton.tsx
          MonoText.tsx
          EmptyState.tsx
        molecules/
          MetadataField.tsx
          SectionHeader.tsx
          PaginationControls.tsx
          HandoverMenu.tsx
          NavItem.tsx
          ProjectSelect.tsx
          SearchBox.tsx
        organisms/
          AppShell.tsx
          Sidebar.tsx
          Topbar.tsx
          AnnotationDrawer.tsx
          MarkdownArticle.tsx
          DocumentMetaPanel.tsx
          TaskNavigationPanel.tsx
        pages/
          WorkspacePage.tsx
          ProjectOverviewPage.tsx
          ProjectWorkstreamsPage.tsx
          ProjectTasksPage.tsx
          DashboardPage.tsx
          WorkstreamDetailPage.tsx
          DocumentReaderPage.tsx
          DocumentListPage.tsx
  public/
    index.html
    assets/
```

## Boundaries

- `components/ui`: shadcn-generated files only. Do not add Delano-specific orchestration here.
- `components/atoms` and `components/molecules`: reusable Delano design vocabulary.
- `components/organisms` and `pages`: viewer-specific composition and page layout.
- `lib/domain`: pure functions only. No React, no DOM, no styling.
- `lib/markdown`: rendering and block/anchor helpers. Preserve markdown behavior before replacing internals.

## Component Decomposition Map

| Current responsibility | Target component | Base |
| --- | --- | --- |
| Buttons, links, icon actions | `Button`, `IconButton`, `CopyButton` | shadcn `Button`, `Tooltip` |
| Status labels | `StatusBadge` | shadcn `Badge` |
| Count pills | `CountBadge` | shadcn `Badge` |
| Metadata rows | `MetadataField`, `MetadataList` | local molecule plus shadcn primitives |
| Section headings | `SectionHeader`, `CollapsibleSection` | Radix `Collapsible`, shadcn `Button` |
| Pagination | `PaginationControls` | shadcn `Pagination` |
| Project selection | `ProjectSelect` | Radix/shadcn `Select` |
| Responsive side navigation | `SidebarSheet`, `AppShell` | shadcn `Sheet` or `Sidebar` |
| Cards and panels | `ProjectCard`, `DocumentMetaPanel` | shadcn `Card`, `Separator`, `ScrollArea` |
| Tables | `WorkspaceTable`, `TaskTable` | shadcn `Table` |
| Markdown body | `MarkdownArticle` | local component first, possible `react-markdown` later |
| Annotation list | `AnnotationDrawer` | shadcn `Card`, `Checkbox`, `Marker`, `Textarea` |
| Agent handover | `HandoverMenu`, row action menus | shadcn `DropdownMenu`, `Button`, `Tooltip`, `CopyButton` |

## Token Strategy

Preserve the Delano/Keendoc-like visual language:

- warm off-white background;
- near-black ink;
- hairline borders;
- small radii;
- restrained status colors;
- Inter-like sans stack and JetBrains-like mono stack;
- no gradients, heavy shadows, or decorative card nesting.

Map that language through shadcn semantic variables and variants. Do not restyle primitives repeatedly in page components.

## Refactor Order

### Loop 1: Domain Extraction

- Move status, date, pagination, navigation, copy, and workspace helpers out of `App.tsx`.
- Add focused tests for pure helpers.
- Keep rendered UI behavior unchanged.
- Validation target: helper tests plus viewer server tests pass.

### Loop 2: Markdown Extraction

- Move current markdown rendering and block/anchor helpers into `lib/markdown`.
- Add fixtures for headings, lists, code blocks, task lists, blockquotes, tables, and annotation marks before changing rendering behavior.
- Protect annotation mark behavior with fixtures for duplicate quotes, formatted text boundaries, cross-block quotes, special characters, and stale-anchor detection.
- Preserve `dangerouslySetInnerHTML` only behind `MarkdownArticle` until a tested renderer replacement exists.
- Validation target: markdown fixtures and browser smoke show no document regression.

### Loop 3: Component Split

- Move `Sidebar`, `Topbar`, `AnnotationDrawer`, `HandoverMenu`, `MetadataCard`, nav rows, and document layout into components.
- Keep shadcn-generated files isolated in `components/ui`.
- Add Delano-specific wrappers only where semantics justify them.
- Validation target: TypeScript build and browser smoke.

### Loop 4: Radix Behavior Replacement

- Replace remaining custom interaction behavior with Radix/shadcn components where useful:
  - project selection with `Select`;
  - mobile sidebar with `Sheet`;
  - overview folding with `Collapsible`;
  - icon-only actions with `Tooltip`;
  - repeated tabular data with `Table`.
- Validation target: keyboard, focus, and tablet checks in browser.

### Loop 5: Visual Feedback and Polish

- Run local viewer at a fixed URL.
- Capture a known-good before screenshot and a post-change screenshot for desktop and tablet widths.
- Verify protected interactions before visual review: select text, create annotation, drawer row appears, highlight appears, hand selected annotations to an agent or copy the command, delete the temporary annotation.
- Ask for two prompt-based visual reviews:
  - `claude -p "<prompt>"`
  - `pi -p "<prompt>"`
- Fold accepted visual feedback into the smallest safe UI changes.
- Record evidence in `.project` before closing a refactor task.

## Visual Feedback Prompt Template

```text
Review the Delano viewer refactor from the screenshot and implementation notes.

Focus on visual and interaction quality:
- content width and tablet readability;
- whether the shadcn/Radix primitives look native rather than imitation;
- hierarchy, density, spacing, and sidebar discoverability;
- annotation drawer and handover-menu usability;
- regressions against a quiet Delano/Keendoc-style local review tool.

Do not propose a new product direction. Return concise issues, severity, and concrete fixes.
```

## Prompt Feedback Findings

Prompt feedback from `claude -p` and `pi -p` on 2026-06-30 agreed that the loop structure is sound and the Delano/Keendoc visual language is preserved. Fold these issues into future refactor tasks:

| Finding | Severity | Loop Impact |
| --- | --- | --- |
| Annotation mark rendering uses first-match HTML string replacement and can mis-highlight duplicate, formatted, special-character, or cross-block quotes. | high | Add fixtures before Loop 2 extraction so broken behavior is not encoded as the baseline. |
| Selection popover positioning only clamps bottom/right and can drift off-screen near tablet edges. | medium | Include edge-selection browser checks before changing annotation UI. |
| Annotation drawer and chat can create nested vertical scroll regions on tablet. | medium | Decide the scroll owner during component split and tablet review. |
| Warning and blocked statuses can collapse into the same destructive badge tone. | medium | Preserve status severity distinction when extracting `StatusBadge`. |
| The cool annotation accent is visually defensible but should remain the single intentional cool cue. | low | Document and protect token discipline during polish. |
| Global `button { cursor: default }` weakens affordance for clickable controls. | low | Revisit in the shadcn polish loop. |

## Validation Loop

Every implementation loop should end with the smallest meaningful checks first, then release checks when package/runtime files changed:

```bash
npm --prefix .delano/viewer/ui run build
node --test test/viewer-server.test.js
npm run build:assets
npm run check:package-manifest
npm test
node bin/delano.js validate -- --release
```

On this Windows machine, if `python` and `python3` resolve to Microsoft Store aliases, validation can be run with a temporary shim that delegates `python3` and `python` to `py -3`.

## Stop Conditions

Stop and ask before continuing if:

- a refactor would require changing `.delano/viewer/server.js` API contracts outside the current task;
- markdown behavior cannot be preserved with fixtures;
- annotation mark fixtures show existing ambiguity that cannot be represented without changing the data model;
- package payload size or dependency surface materially increases;
- `claude -p` or `pi -p` returns visual feedback that conflicts with the existing project contract;
- the viewer cannot be validated in a browser after two focused repair attempts.

## Done Criteria

- The plan remains discoverable under `.project/projects/015-delano-viewer-annotations-agent-chat/loopfile.md`.
- The project update log points to this loopfile.
- Future refactor tasks can use this file as the iteration contract.
- Validation evidence is recorded after any mutation.
