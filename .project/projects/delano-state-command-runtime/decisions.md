# Decisions

## 2026-05-12T11:25:19Z: Templates are the creation source of truth

Decision: All new project, workstream, task, and update creation commands must render from `.project/templates`.

Rationale:
- The templates are the canonical artifact shape.
- Inline generators created drift across `init`, `import-spec-kit`, and research flows.
- Agents and humans should not need to remember multiple artifact shapes.

## 2026-05-12T11:25:19Z: Lifecycle commands patch existing artifacts

Decision: Commands such as `start`, `close`, `block`, `defer`, and `update` must patch existing artifacts instead of regenerating from templates.

Rationale:
- Existing artifacts contain user-authored markdown that must be preserved.
- Lifecycle commands should be fast and scoped.
- Full validation remains the audit gate for merge drift and release readiness.

## 2026-05-12T13:32:13Z: Defer legacy shell generator redirection

Decision: Keep `.agents/scripts/pm/init.sh`, `.agents/scripts/pm/import-spec-kit.sh`, `.agents/scripts/pm/research.sh`, and their `.claude` mirrors unchanged in this slice. Redirecting those legacy generators to the native template-backed commands is deferred to follow-up work.

Rationale:
- T-001 proves the native `project`, `workstream`, `task`, and `update` command path without expanding this branch into a broad shell migration.
- The legacy scripts have distinct compatibility surfaces and generated fixture behavior that should be migrated with dedicated tests.
- The package payload and manifest are already covered by `npm test`, `npm run check:package-manifest`, and `bash .agents/scripts/pm/validate.sh`.

Follow-up:
- Add a dedicated task to redirect or retire legacy shell generators after the native command interface has been reviewed.
- Rebuild `assets/payload/` and re-check package manifest drift in that follow-up if any shipped shell entrypoints change.
