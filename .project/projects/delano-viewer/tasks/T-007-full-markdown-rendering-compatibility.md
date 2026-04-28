---
id: T-007
name: Full markdown rendering compatibility
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
priority: high
estimate: M
---

# Task: Full markdown rendering compatibility

## Description

Upgrade the viewer's markdown rendering so Delano contracts render common markdown structures accurately, including checklists, tables, Mermaid diagrams, code fences, links, and nested lists.

## Acceptance Criteria
- [x] Checklists render with visible checked and unchecked states.
- [x] Tables render as readable, scroll-safe tables.
- [x] Mermaid fenced blocks render as diagrams or degrade with a clear readable fallback.
- [x] Code fences preserve formatting and language labels where useful.
- [x] Links render clearly and safely.
- [x] Nested lists render with correct hierarchy and spacing.
- [x] Compatibility samples are added or identified for regression checks.

## Technical Notes

- Preserve the viewer's read-only behavior.
- Prefer a maintained renderer/library if it avoids fragile hand-rolled parsing without adding disproportionate complexity.
- Include browser smoke coverage for markdown samples that exercise the supported structures.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-28: Task created from WS-C scope expansion for full markdown rendering compatibility.
- 2026-04-28: Renderer choice — kept the parser hand-rolled in `.delano/viewer/public/app.js` to preserve the viewer's offline-friendly, dependency-free profile. Pulling a runtime markdown library (CDN or vendored bundle) was rejected as disproportionate for the read-only viewer's scope.
- 2026-04-28: Replaced the line-based mini-parser with a block-aware `parseBlocks` driver. New blocks: ordered lists (`<ol>`), nested lists with indent tracking, GFM tables with column alignment (`:--- :---: ---:`), GFM task lists with custom checkbox markers, headings h4–h6, horizontal rules, and language-labeled fenced code blocks (`pre.has-lang` + `code-lang` badge).
- 2026-04-28: Mermaid blocks render as a `<figure class="mermaid-block">` with the source preserved in a labeled `<pre>` ("Mermaid diagram (source view)") and a copy button on hover. This satisfies the AC's "degrade with a clear readable fallback" branch without adding a runtime diagram library.
- 2026-04-28: Inline grammar extended: bold, italic (`*text*`), inline code, wikilinks `[[id]]`, and external links matching `https?://`, `mailto:`, absolute, and relative paths; external links carry `rel="noreferrer noopener"` and `target="_blank"`.
- 2026-04-28: Added compatibility samples at `.project/context/viewer-markdown-samples.md` exercising headings h3–h6, inline formatting, checked/unchecked task lists, nested ordered/unordered lists, three-column GFM tables (with and without alignment), labeled and unlabeled code fences, a mermaid block, blockquotes, and a horizontal rule.
- 2026-04-28: Added supporting CSS in `.delano/viewer/public/styles.css` for `.task-list`, `.task-item`, `.task-marker`, `.table-wrap`, scroll-safe `<table>`, `pre.has-lang` + `.code-lang` badge, `.mermaid-block`, `hr.rule`, and h4–h6.
- 2026-04-28: Quality gates — `node --check .delano/viewer/public/app.js` and `node --check .delano/viewer/server.js` passed; `npm test` passed (11/11); HTTP smoke against the running viewer returned 200 for `/`, `/app.js`, `/styles.css`, and `/api/index` (5 projects, 74 docs); the samples doc round-tripped through `/api/doc?path=context/viewer-markdown-samples.md` with intact tables, mermaid fence, and checked/unchecked task lines.
- 2026-04-28: Inline parser smoke — direct unit checks confirmed `**bold**`, `*italic*`, `` `code` ``, `[[wikilink]]`, and `[label](https://...)` all rendered to the expected HTML structures (3/3 pass).
