---
name: Viewer Review Mode and Project Dashboard
slug: viewer-review-dashboard
owner: bart
status: complete
created: 2026-07-13T21:53:24Z
updated: 2026-07-13T22:28:06Z
outcome: Reading remains annotation-free until Review is explicitly enabled, the review drawer never changes document geometry, and every project opens to a useful current-state delivery dashboard.
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: A source inspection and live T3 browser reproduction established the interaction and layout causes; no throwaway implementation probe is needed.
operating_mode: feature
---

# Spec: Viewer Review Mode and Project Dashboard

## Executive Summary

Make Review an explicit viewer mode rather than an incidental side effect of text selection or existing annotations. Opening Review must reveal annotation highlights and controls without narrowing the document. Replace the project file inventory with an honest dashboard that summarizes the current contract, execution state, workstreams, and recent evidence without fabricating historical or predictive data.

## Problem and Users

Delano’s default reading experience currently behaves like an annotation editor: selecting text creates a yellow mark and opens the annotation composer even when Review is off. Documents with annotations can also open the review surface implicitly. The fixed review drawer is visually overlaid, but a compensating page padding rule still compresses the reading pane.

Project overview is likewise an inventory rather than an overview. Four disconnected metric cards and an all-files table make operators reconstruct the project’s intent and delivery state themselves. Repository maintainers, coding agents, and reviewers need a glanceable current-state room with direct paths to the source contracts.

## Outcome and Success Metrics

- In default reading mode, selecting text creates zero annotation marks, opens zero annotation composers, and performs zero annotation writes.
- Review opens only through an explicit user action; documents with existing annotations still begin in reading mode.
- At desktop widths, opening or closing Review changes the reading article width by no more than one CSS pixel.
- Every project overview exposes its status, task state distribution, workstream progress, spec summary, and recent evidence with direct navigation to the underlying contract.
- The project overview no longer renders the generic all-files table.

## User Stories

- US-001: As a reader, I want ordinary text selection in reading mode, so that copying or inspecting text never starts an annotation accidentally.
- US-002: As a reviewer, I want an explicit Review mode, so that annotation highlights, creation, and handover controls appear only when I intend to review.
- US-003: As a reviewer, I want the handover drawer to overlay the page without reflowing the document, so that my reading position and line lengths remain stable.
- US-004: As a project operator, I want a project dashboard that explains intent and current delivery state, so that I can identify the next useful source or task without scanning a file table.

## Acceptance Scenarios

- AC-001: Given Review is off, when a user selects document text by mouse or keyboard, then native selection remains available and no yellow annotation mark, composer, or write is created.
- AC-002: Given Review is explicitly enabled on a writable workspace, when a user selects document text, then the annotation composer opens and the draft can be saved using the existing annotation workflow.
- AC-003: Given a document has existing annotations, when it first opens or Review is closed, then its marks and annotation drawer are hidden; enabling Review reveals the existing marks and permits their existing interactions.
- AC-004: Given a linked read-only worktree, when Review is enabled, then existing annotations remain inspectable while new annotation creation stays disabled and ordinary selection is preserved.
- AC-005: Given a desktop viewport, when Review opens and closes, then the drawer overlays the header and body while the document article width and layout position remain stable within one CSS pixel.
- AC-006: Given a project with task and workstream contracts, when its overview opens, then it shows project status, updated time, a truthful current task-state visualization, workstream progress, the spec summary, and recent progress evidence with direct source navigation.
- AC-007: Given a completed, empty, or single-workstream project, when its overview opens, then the dashboard uses meaningful empty/completed states and never invents history, forecasts, or placeholder metrics.
- AC-008: Given a narrow viewport, when the dashboard or Review mode is used, then content remains readable without page-level horizontal overflow and controls remain keyboard accessible.
- AC-009: Given implementation is complete, when focused tests, the viewer build, package tests, contract validation, and T3 browser checks run, then evidence is recorded against the delivery tasks and any skipped or baseline-failing checks are named.

## Scope

### In Scope

- Explicit Review mode and read/review interaction boundaries.
- Annotation visibility and creation gating for writable and read-only worktrees.
- Overlay-only review drawer geometry and responsive behavior.
- A project dashboard derived from existing spec, workstream, task, status, and progress-update contracts.
- Direct dashboard navigation to source documents, workstreams, and tasks.
- Focused automated and live-browser regression coverage plus viewer documentation.

### Out of Scope

- Annotation storage, schema, handover protocol, or API redesign.
- Predictive completion dates, historical scope trends, velocity calculations, or new persisted analytics.
- User-configurable dashboard layouts or chart builders.
- Tracker synchronization, workflow-state semantics, or redesign of other workspace tables.
- A broader visual-system rewrite.

## Functional Requirements

- FR-001: `DocumentReaderPage` shall keep reading and Review as explicit UI states independent of annotation count.
- FR-002: `MarkdownArticle` shall only install annotation selection handlers and paint annotation marks when Review is active.
- FR-003: Review shall distinguish mark visibility from creation permission so linked worktrees can inspect annotations without composing new ones.
- FR-004: Closing Review shall remove review-only marks and dismiss any unsaved draft composer without changing the stored annotation set.
- FR-005: The review drawer shall remain a fixed overlay and shall not add compensating width or padding to the document layout.
- FR-006: The project dashboard shall compute task-state totals from canonical task documents and group delivery progress by workstream.
- FR-007: The project dashboard shall summarize the project spec from indexed content and list recent progress evidence in descending updated order.
- FR-008: Dashboard sections shall provide source-preserving navigation using existing document, task, and workstream routes.

## Non-Functional Requirements

- Use the existing Local Dossier visual language: warm paper, restrained slate accent, flat surfaces, clear typography, and no ornamental gradients or heavy shadows.
- Avoid nested cards and generic SaaS metric-card grids; section hierarchy must work through spacing, rules, type, and proportion.
- Visualizations must encode available contract data only and include text equivalents or labels for accessibility.
- Review and dashboard controls must expose clear names, focus states, and keyboard behavior.
- No private absolute paths or attachment locations may enter committed contracts, documentation, fixtures, or logs.
- Preserve existing reader, annotation persistence, and semantic navigation behavior outside the stated changes.

## Assumptions

- The indexed spec snippet is sufficient for the overview brief; opening the spec provides the complete narrative.
- Canonical task statuses can be grouped into done, active, blocked, planned, and deferred without altering lifecycle semantics.
- Recent project `progress` documents are the authoritative evidence stream currently available to the viewer.
- The user’s request to “get to work” approves this bounded spec and execution without an additional approval pause.

## Needs Clarification

- None. Research resolved the material behavior and data-shape questions.

## Hypotheses and Unknowns

- A segmented current-state execution map will provide more trustworthy signal than a simulated historical line chart because Delano currently indexes snapshots, not task-state history.
- Existing workstream/task routes can support every dashboard drilldown without new server endpoints.

## Touchpoints to Exercise

- Default read-mode selection by mouse and keyboard.
- Review entry, annotation creation, existing mark interaction, draft dismissal, and exit.
- Writable repository and linked read-only worktree behavior.
- Drawer open/closed geometry at desktop and narrow viewports.
- Active, completed, empty, and single-workstream project dashboards.
- Direct navigation from spec, evidence, workstream, and task dashboard elements.

## Probe Findings

- Live T3 reproduction showed a read-mode selection creates `.md-annotation-mark` and opens the composer while Review reports inactive.
- Live geometry measurement showed the article width falling from approximately 760px to 517px because the page wrapper adds 416px right padding when Review opens.
- Source inspection confirmed annotation count currently opens Review implicitly and `MarkdownArticle` installs selection/highlighting behavior unconditionally.
- The current index provides present task/workstream state and timestamped evidence, but no historical task-state series suitable for a truthful burndown or forecast.

## Footguns Discovered

- Treating `reviewOpen` as both explicit mode and panel visibility makes existing annotation data change the document’s interaction mode.
- Returning early only after the highlighter has processed a selection can erase native selection; read mode must avoid installing the annotation path altogether.
- A visually fixed drawer can still cause reflow when an ancestor adds compensating padding.
- Rendering a Linear-like trend graph from current snapshots would imply history the product does not store.

## Remaining Unknowns

- None block execution. Visual density and responsive thresholds will be tuned against the live preview.

## Dependencies

- Existing annotation API and persistence behavior.
- Existing project index fields for specs, workstreams, tasks, statuses, timestamps, and snippets.
- Existing document, workstream, and task navigation routes.

## Approval Notes

- 2026-07-13T21:58:47Z: Spec approved from user request after source and live-browser research established low uncertainty.

- Approved for implementation by the user’s explicit instruction to follow Delano WoW and begin work on 2026-07-13.
