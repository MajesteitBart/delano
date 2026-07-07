# Tech Context

## Stack
- Markdown contracts and templates for delivery artifacts under `.project/`.
- Node/npm for the published CLI package, package asset build, viewer server, native validation entrypoints, and the Node test runner.
- Bash and Python remain part of the PM/operator script layer and validation internals, especially through `.agents/scripts/pm/validate.sh`, `status.sh`, `next.sh`, and related scripts.
- Vite, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix primitives, Lucide icons, and `@plannotator/web-highlighter` power the current viewer UI source under `.delano/viewer/ui`.
- Git supports repository discovery, worktree state inspection, package drift checks, and sync-oriented workflows.

## Runtime Constraints
- Current operator environment is Windows-first with PowerShell available. Native commands such as `delano status --brief`, `node bin/delano.js validate`, `node --test test/viewer-server.test.js`, and npm scripts are the dependable local paths.
- Bash wrapper commands remain canonical in docs and scripts, but they require an actual Bash runtime. In this worktree, `bash .agents/scripts/pm/status.sh` failed because `/bin/bash` was unavailable.
- Canonical command paths should use `.agents/scripts/...`; `.claude/scripts/...` is compatibility-only when the mirror exists.
- Shared docs and contracts must avoid absolute path leakage.
- `.project` and `.agents` are seeded artifacts and runtime assets, not package-owned mutable state after install.
- Viewer writes are intentionally constrained: annotation state and handover files live under `.project/viewer/`, while canonical `.project` markdown writes require preview/apply protections.

## Integration Points
- `.project/registry/linear-map.json` and `.project/registry/migration-map.json` capture tracker mapping state.
- `.agents/scripts/pm/init.sh`, `validate.sh`, `status.sh`, `next.sh`, and `blocked.sh` remain the shell operator interface.
- `bin/delano.js` and `src/cli/` provide the native CLI path for project, workstream, task, update, context, validate, status, and viewer commands.
- `src/cli/lib/context-reader.js` reads `.project/context/` safely and exposes profile metadata to both `delano context` and the viewer.
- `.delano/viewer/server.js` is the stable local HTTP/API boundary; `.delano/viewer/ui/src` is the Vite source app; `.delano/viewer/public/assets` is the shipped built runtime.
- `.project/viewer/annotations.json` stores local annotation state and `.project/viewer/handovers/` stores deterministic agent handover files.
- `install-delano.sh` is the current shell-first bootstrap path for installing Delano into another repository.
