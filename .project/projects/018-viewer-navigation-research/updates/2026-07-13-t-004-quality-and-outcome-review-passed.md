---
timestamp: 2026-07-13T18:27:01Z
status: in-progress
task: T-004
stream: WS-A
---

# Progress Update

## Completed
- Exposed nested project research as a dedicated project collection and kept nested research `progress.md` documents in that collection.
- Preserved semantic project destinations across project and worktree switches, with validated fallbacks when an equivalent target is unavailable.
- Reduced Workspace navigation to the requested six entries and changed task and annotation badges to actionable open counts.
- Updated viewer documentation and rebuilt the viewer and npm payload.

## In Progress
- None

## Blockers
- None

## Next Actions
- Close T-004 and apply the scoped Delano lifecycle rollup.

## Outcome Review

### Target Outcome

Make research discoverable, keep users on the same semantic destination during context switches, and simplify Workspace navigation to the requested actionable entries and counts.

### Actual Outcome

The viewer now indexes and renders nested research collections, preserves research and other semantic destinations across project and linked-worktree changes, and presents Projects, Tasks, Context pack, Annotations, Warnings, and Blockers in the requested order. Tasks and Annotations report open counts.

### Delta

No acceptance delta. Research and Progress remain visible in the selected-project section even at zero so a preserved destination stays understandable.

### Root Causes

The previous index classified files primarily by filename, navigation reset context changes to overview, and Workspace navigation mixed global data views with actionable workspace entry points.

### Follow-up Actions

None required for this scope.

## Quality Evidence

- Viewer build/type-check and focused source/domain fixtures passed.
- `npm test` passed 117 tests with zero failures.
- Linked-worktree and narrow-layout browser smoke passed with no captured page, promise, console error, or console warning events.
- Package payload rebuilt with 216 files; manifest drift check passed.
- Release validation passed with zero errors and zero warnings.
- Detailed browser evidence: `.agents/logs/tests/t004-viewer-navigation-browser-smoke.md`.
