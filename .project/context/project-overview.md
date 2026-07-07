# Project Overview

## Mission
- Delano is an agent-agnostic delivery system that turns outcomes into specs, plans, tasks, execution evidence, and learnings through shared file contracts and runtime scripts.
- This repository is the canonical source for the handbook, CLI package, runtime assets, templates, guarded viewer, context reader, and reference install path used when Delano is adopted in other repositories.

## Current Delivery State
- `delano status --open --brief` reports no open projects in this worktree.
- `delano status --brief` reports all tracked projects with complete specs, done plans, and zero open tasks, including CLI packaging, context reader, contract enforcement, viewer redesign, viewer annotations and handover, vNext runtime work, sync, learning, and safety projects.
- The current handover work is not a new product feature. It is a context refresh triggered by a viewer annotation on `.project/context/README.md`.

## Current Product Shape
- The npm package is `@bvdm/delano` at version `0.2.11` with `bin/delano.js` as the CLI entrypoint.
- `.agents/` is the canonical runtime tree. `.claude/` is a generated compatibility mirror and should be updated through `npm run sync:claude-mirror`, not edited directly.
- `.project/` remains the source of truth for delivery contracts, registry state, shared context, and evidence.
- `.delano/viewer` is now a guarded local review UI: it serves `.project` markdown, supports annotations, exports and handover files, and keeps canonical markdown writes behind explicit preview/apply boundaries.
- `.project/context/` is a living orientation pack for agents and maintainers. It should change when repo architecture, validation reality, or active delivery assumptions change.

## Current Health
- `.agents/` is the canonical runtime tree. `.claude/` exists in this repo as a directory mirror with matching contents, not as a symlink.
- Native Delano and Node validation are the reliable Windows paths in this worktree. Bash wrapper commands remain documented because they are canonical on POSIX-like environments, but this Windows environment currently lacks `/bin/bash`.
- The primary current context debt was stale framing around CLI packaging and the viewer; this pack now reflects the completed portfolio and guarded viewer handover model.
