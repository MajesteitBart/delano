---
type: research_findings
project: viewer-review-dashboard
slug: review-mode-dashboard
created: 2026-07-13T21:53:25Z
updated: 2026-07-13T22:27:08Z
---

# Findings: Review Mode and Project Dashboard

## Source References

- User-provided reading-mode and review-panel screenshots.
- User-provided project dashboard sketch.
- `.delano/viewer/ui/src/pages/DocumentReaderPage.tsx`.
- `.delano/viewer/ui/src/components/organisms/MarkdownArticle.tsx`.
- `.delano/viewer/ui/src/components/organisms/AnnotationDrawer.tsx`.
- `.delano/viewer/ui/src/pages/ProjectPages.tsx`.
- `.delano/viewer/ui/src/lib/domain/types.ts` and `workspace-model.ts`.
- T3 Preview reproduction at the running local viewer.
- Linear documentation for Insights, Dashboards, Project graph, Cycle graph, and Project overview.

## Observations

- `MarkdownArticle` always constructs and runs the web highlighter. A mouse-up or keyboard selection calls `fromRange` before any review-state check, so reading-mode selection becomes a yellow draft mark and opens annotation UI.
- `DocumentReaderPage` uses `reviewOpen` for both mode and panel visibility, and automatically sets it true when a document already has annotations. Reading is therefore not a stable default review boundary.
- Opening Review adds `min-[1280px]:pr-[416px]` to the entire reader wrapper. T3 measured the article at about 760px before Review and about 517px after, while the fixed 400px panel was open. Removing this compensating padding preserves the overlay without changing the panel.
- The existing Project overview is four metric cards, a newest-first document table, and two navigation buttons. It provides inventory but no project narrative, workstream shape, delivery distribution, or evidence recency.
- Linear dashboards combine metrics, charts, and tables that drill into underlying records. Its project and cycle graphs distinguish scope, started, and completed work. Delano can adopt the information principle without copying the interface or inventing historical velocity.
- The Delano index provides current task status, workstream membership, update timestamps, project status, and source documents. It does not preserve enough task-state history for a truthful trend or completion-prediction graph.
- The dashboard sketch's wide diagram, project brief, and workstream tree map cleanly to an execution map, spec-derived brief, workstream progress list, and recent evidence ledger.

## Options Considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Keep annotation selection always active | No extra mode switch | Violates reading expectations and creates accidental writes | Rejected |
| Explicit Review mode gates painting, creation, and highlight interaction | Clear intent, ordinary reading selection, preserves current flow | Adds one state boundary to test | Selected |
| Separate review route | Strong separation | Loses reading position and adds navigation overhead | Rejected |
| Keep reader compensation padding | Drawer never covers text | Compresses the document and contradicts overlay behavior | Rejected |
| Fixed overlay with no layout compensation | Preserves document width and existing panel semantics | Temporarily covers the right side by design | Selected |
| Historical line graph | Familiar dashboard visual | Current index cannot support it honestly | Rejected |
| Current-state execution map plus brief, workstreams, and evidence | Actionable, traceable, honest, directly navigable | Requires a compact derived dashboard model | Selected |

## Fold-Forward Candidates

| Finding | Target Artifact | Proposed Change |
| --- | --- | --- |
| Review state is conflated with panel visibility | `spec.md`, `plan.md`, review task | Define explicit Review mode and keep read mode non-annotating. |
| Reader compression is caused by wrapper padding | `plan.md`, overlay task | Remove layout compensation and verify stable reader geometry. |
| Project overview lacks narrative and delivery shape | `spec.md`, dashboard task | Replace the document table with a current-state dashboard. |
| Historical predictions would be fabricated | `decisions.md` | Record current-state execution map as the honest visualization boundary. |
| Dashboard records should remain actionable | `plan.md`, dashboard task | Make spec, workstream, task, and evidence rows navigate to their source views. |

## Open Questions

- None blocking. Empty, single-workstream, completed, and linked-worktree states must be covered during implementation.

## Fold-Forward Result

- Findings were incorporated into `spec.md`, `plan.md`, `decisions.md`, `WS-A`, tasks T-001 through T-005, implementation, documentation, and recorded quality evidence.
- Empty, single-workstream, completed, active, writable, read-only, desktop, and narrow states were covered by deterministic tests or T3 checks.
- The research intake is complete; no unresolved recommendation remains outside the canonical delivery artifacts.
