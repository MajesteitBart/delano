# System Patterns

Capture architecture and delivery patterns that should be reused.

## Handbook-First Delivery
- Changes to runtime behavior, templates, and operator guidance should be aligned with `HANDBOOK.md`, not invented ad hoc in scripts or adapter docs.
- Planning follows the handbook stages: discovery, optional probe, planning, breakdown, sync, execution, quality, closeout, and learning.

## File-Contract-First State
- `.project/` is the source of truth for delivery state. Scripts and future tooling should read and respect those contracts instead of replacing them with hidden state.
- Project context files are part of execution continuity and should be updated when repo reality changes.

## Thin Runtime Wrapping
- Delano favors thin wrappers around existing execution scripts over large rewrites. The current PM scripts are shell/Python-driven and should remain the execution layer unless there is a strong reason to replace them.
- Adapter entrypoints stay minimal and point back to the shared runtime and handbook.

## Compatibility Without Dual Truth
- `.claude/` may mirror `.agents/`, but it is compatibility infrastructure only. New work should treat `.agents/` as canonical and avoid creating a second source of truth.

## Conservative Installation
- Installation and packaging flows should compute explicit plans, surface conflicts early, and avoid silently overwriting `.project/` or `.agents/` content.
- Seeded files may establish a repo, but once installed the consumer repo owns its own `.project` state.
