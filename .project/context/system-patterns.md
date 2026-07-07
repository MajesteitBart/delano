# System Patterns

Capture architecture and delivery patterns that should be reused.

## Handbook-First Delivery
- Changes to runtime behavior, templates, and operator guidance should be aligned with `HANDBOOK.md`, not invented ad hoc in scripts or adapter docs.
- Planning follows the handbook stages: discovery, optional probe, planning, breakdown, sync, execution, quality, closeout, and learning.

## File-Contract-First State
- `.project/` is the source of truth for delivery state. Scripts and future tooling should read and respect those contracts instead of replacing them with hidden state.
- Project context files are part of execution continuity and should be updated when repo reality changes.
- Use the Delano CLI for project, workstream, task, and update lifecycle mutations when possible so scoped rollups and evidence files stay coherent.

## Thin Runtime Wrapping
- Delano favors thin wrappers around existing execution scripts over large rewrites. The CLI should make the runtime easier to invoke without hiding the file contracts or replacing the script layer.
- Adapter entrypoints stay minimal and point back to the shared runtime and handbook.

## Compatibility Without Dual Truth
- `.claude/` may mirror `.agents/`, but it is compatibility infrastructure only. New work should treat `.agents/` as canonical and avoid creating a second source of truth.

## Guarded Viewer Writes
- The viewer is no longer only a passive browser, but it is still guarded: annotation state and handover files are allowed local artifacts, while canonical markdown writes need diff preview, stale-baseline checks, path containment, and explicit apply confirmation.
- Agent handover should reference repo-relative files and generated handover attachments instead of stuffing raw context into prompts.
- Task and workstream handover uses explicit `start` and `review` intents so agents know whether to implement acceptance criteria or verify delivered work and evidence.

## Source App With Shipped Assets
- Viewer UI source lives in `.delano/viewer/ui/src` and uses Vite/shadcn/Radix conventions.
- The package ships built assets from `.delano/viewer/public/assets`; run the viewer UI build and `npm run build:assets` after source changes that affect shipped runtime behavior.

## Conservative Installation
- Installation and packaging flows should compute explicit plans, surface conflicts early, and avoid silently overwriting `.project/` or `.agents/` content.
- Seeded files may establish a repo, but once installed the consumer repo owns its own `.project` state.
