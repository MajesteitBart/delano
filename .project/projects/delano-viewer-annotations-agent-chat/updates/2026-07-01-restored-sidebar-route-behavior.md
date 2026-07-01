---
timestamp: 2026-07-01T09:00:48Z
status: done
task: T-012
stream: WS-D
---

# Progress Update

## Completed
- Restored viewer sidebar route behavior after regression: workspace rows, project overview, source contracts, workstreams, tasks, and progress entries are clickable again; tablet browser validation shows the sidebar remains visible at 1080px with no disabled sidebar controls or horizontal overflow.
- Reintroduced route-backed workspace pages for Context pack, Projects, Open work, Progress, Validation, Warnings, and Blockers using shadcn Table/Card/Button primitives.
- Restored project-level sidebar entries for Project overview, Spec, Plan, Decisions, Workstreams, Tasks, and progress logs; removed the dead Viewer settings affordance.

## Evidence
- `npm --prefix .delano/viewer/ui run typecheck` passed.
- `npm --prefix .delano/viewer/ui run build` passed; Vite kept the existing AI SDK browser externalization and large chunk warnings.
- Browser click-through passed for Projects, Context pack, Workstreams, Tasks, Spec, and Open work. Spec still renders `Annotations`, `Chat`, and `Details` tabs.
- Tablet viewport check at 1080px: sidebar visible at 232px, app columns `232px 848px`, no disabled sidebar buttons, no horizontal overflow.

## In Progress
- 

## Blockers
- None

## Next Actions
- 
