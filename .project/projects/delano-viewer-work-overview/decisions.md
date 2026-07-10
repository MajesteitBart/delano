---
name: Delano Viewer Work Overview
slug: delano-viewer-work-overview
owner: Bart
created: 2026-07-10T07:48:58Z
updated: 2026-07-10T10:02:02Z
---

# Decisions: Delano Viewer Work Overview

## Active Decisions

### 2026-07-10: The top bar identifies the running viewer instance

- Decision: Replace the route/document title at the left of the global top bar with a persistent `worktree · repository` identity on every viewer surface. The server returns the display identity; the frontend renders and truncates it without deriving it from route state. Page/document titles and contextual statuses remain in content, the full identity is available accessibly, and browser-tab titles use the same prefix. No absolute path is shown.
- Rationale: Operators can run several repositories and worktrees in separate Delano viewers at once. A repeated page title does not identify the window, while worktree plus repository does and leaves the main page heading responsible for current location.

### 2026-07-10: Supplied 1920×1080 screenshots lock the viewer chrome

- Decision: Treat the user's six current-viewer screenshots at 100% zoom as the visual source of truth. All feature mockups must reproduce the existing 263px sidebar, lowercase leaf-logo lockup, 56px top bar, action placement, centered content column, table surfaces, and drawer anatomy. Only feature content and navigation labels may change.
- Rationale: The first mockup loop preserved the general palette but materially reinterpreted the logo, sidebar, and top bar. The user explicitly rejected that drift and asked for the current design as the basis.

### 2026-07-10: Actual file activity is Git-provenanced

- Decision: Use read-only Git working-tree and commit history for Updated Files. Keep canonical frontmatter update time separate; never use checkout mtime as historical commit recency.
- Rationale: Live index inspection showed old files without canonical timestamps appearing freshly updated after checkout.

### 2026-07-10: Review and look-ahead labels are derived views

- Decision: Do not add review/Should/Can/Could lifecycle statuses. Review reuses done-task evidence and the existing review handover. Plan derives mutually exclusive labels from canonical status, priority, and dependency state.
- Rationale: Delano's lifecycle is enforced and explicitly treats review as a gate rather than a task status.

### 2026-07-10: One table-query contract serves all tables

- Decision: Share search/filter/sort/query state and controls, while keeping each table's columns/cells local. Apply query operations before pagination.
- Rationale: The current tables duplicate pagination and lack controls; a monolithic data-table abstraction would be harder to adapt than shared behavior primitives.

### 2026-07-10: Git inspection stays bounded and read-only

- Decision: Execute Git with argument arrays, no shell, hard limits, repo-relative output, and graceful unavailable state. Do not stage, commit, fetch, or mutate.
- Rationale: The viewer needs repository truth without broadening its safety boundary.

### 2026-07-10: Design approval gates implementation

- Decision: Create exactly six separate horizontal viewer-native mockups; iterate each with Fable through the Claude CLI until every score is at least 9/10; then request user feedback. All implementation tasks depend on user approval of this gate.
- Rationale: This is the user's explicit requested workflow and protects the high-judgment Home/Review/Plan information architecture before code changes.

## Superseded Decisions

- None.

## Open Decision Questions

- After this delivery, decide separately whether Delano needs a durable human-review attestation contract. The first delivery intentionally does not persist one.
