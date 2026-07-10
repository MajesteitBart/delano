---
type: research_progress
project: delano-viewer-work-overview
slug: viewer-work-information-architecture
created: 2026-07-10T07:49:00Z
updated: 2026-07-10T07:53:51Z
---

# Progress: Viewer work information architecture

## 2026-07-10T07:49:00Z

- Opened research intake for project `delano-viewer-work-overview`.
- Primary question: How should the Delano viewer define and present actual updated files, completed work for review, and upcoming can/should/could work while adding consistent search, filter, and sort behavior to all tables?

## 2026-07-10T07:53:51Z

- Inspected the viewer server index semantics, all current workspace/project tables, navigation, shared shell, handover actions, canonical task lifecycle, dependency-safe next-task selection, current visual references, recent Git history, and a live `/api/index` payload.
- Confirmed the mtime fallback produces false historical recency after checkout; selected Git commit history plus explicit working-tree records for actual file activity.
- Defined Review and Plan as derived views over canonical task contracts, not new lifecycle states.
- Defined the six-screen pre-implementation design set: Home, Review, Plan, Updated Files, filtered table state, and file/detail inspector.
- Fold-forward targets prepared for spec, plan, decisions, workstreams, and tasks.

## Validation Evidence

- `delano validate` was started after intake creation and produced no failure output, but the wrapper did not complete within the 120-second command limit; this timeout is recorded and validation will be rerun after fold-forward with scoped checks if needed.

## Handoff Summary

- Research concluded with high confidence. Proceed to discovery/planning/breakdown, then execute only the design-review task and pause for user feedback before implementation.
