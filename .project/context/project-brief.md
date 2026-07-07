# Project Brief

## Problem
- Delano is both the product and the reference repository, so `.project/context/` must describe the real repo, not the state from an earlier setup pass.
- The previous context still treated CLI packaging as the next planned initiative and treated the repo as mostly script-driven, while the current repo has a shipped npm CLI, a Vite/shadcn viewer source app, a guarded annotation/handover surface, and no open tracked projects.

## Target Outcome
- Keep this repository self-describing for maintainers and coding agents by documenting the current product purpose, runtime boundaries, viewer safety model, operating constraints, validation paths, and known environment caveats.
- Make the context pack good enough for a new agent to resume work without rediscovering that all project contracts are currently closed and that viewer annotation/handover work has superseded the older embedded-chat direction.

## Scope Boundaries
- In scope: repository context for Delano itself, the current canonical runtime model, the CLI/package surface, the context reader, the guarded viewer, and the Windows validation reality for this worktree.
- Out of scope: implementing a new feature, reopening completed projects, changing lifecycle state, editing `.claude/` directly, or treating viewer handover artifacts as canonical project contracts.
