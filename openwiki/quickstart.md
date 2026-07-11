# Delano code wiki

Delano is an agent-agnostic delivery runtime: it turns outcomes into file-backed specifications, plans, workstreams, tasks, decisions, updates, and evidence that humans and coding agents can share. The product is intentionally local-first. `.project/` is delivery truth, `.agents/` is the executable policy/runtime, the npm CLI operates on those files, and `.delano/viewer/` provides a guarded review and editing UI.

## Start here

Requirements:

- Node.js 18 or newer (`package.json`)
- Bash for wrapper commands such as `validate`, `status`, `next`, research, and Spec Kit import
- Python for task selection and substantial validation paths
- Git for normal development and the legacy sparse-download installer

From this repository:

```bash
npm test
npm run viewer
bash .agents/scripts/pm/validate.sh
```

For a consumer repository, install the package and inspect its instructions before creating work:

```bash
npx -y @bvdm/delano@latest --yes
delano onboarding
delano validate
delano viewer
```

Use `delano --help` and `delano <command> --help` as the live command authority. The user-facing guides begin at [`docs/README.md`](../docs/README.md); [`HANDBOOK.md`](../HANDBOOK.md) is the canonical operating model.

## Mental model

```text
bin/delano.js
  -> src/cli/index.js
     -> native Node commands: install, onboarding, context, viewer,
        project, workstream, task, update
     -> Bash-backed wrappers: init, import-spec-kit, research,
        validate, status, next

.project Markdown contracts <-> CLI/runtime validators <-> guarded viewer
          ^                         |
          |                         v
      human/agent edits       schemas, skills, rules, evidence gates

assets/install-manifest.json -> assets/payload/ -> npm package -> consumer repo
```

The package is deliberately thin: it distributes an allowlisted runtime and viewer rather than replacing the file contracts or shell/Python execution layer. See [Architecture](architecture/overview.md).

## Repository boundaries

| Path | Responsibility | Editing rule |
| --- | --- | --- |
| `HANDBOOK.md` | Process and product operating model | Keep runtime policy aligned with it. |
| `.project/` | Specs, plans, workstreams, tasks, decisions, updates, context, viewer state | Delivery source of truth; prefer CLI lifecycle commands over manual frontmatter edits. |
| `.agents/` | Canonical scripts, schemas, rules, hooks, skills, adapters | Edit here, not in `.claude/`. |
| `.claude/` | Generated compatibility mirror | Regenerate with `npm run sync:claude-mirror`. |
| `src/cli/`, `bin/` | npm CLI implementation and entrypoint | Native command surface. |
| `.delano/viewer/server.js` | Dependency-free local HTTP/API server | Enforces path, hash, and confirmation guards. |
| `.delano/viewer/ui/` | React/Vite/TypeScript viewer source | Build before updating package assets. |
| `.delano/viewer/public/` | Compiled viewer runtime | Generated from viewer UI; shipped in npm package. |
| `assets/install-manifest.json` | Installation/package allowlist | Source for `assets/payload/`. |
| `test/` | CLI, package/runtime, and viewer integration tests | Root `npm test` runs Node tests here. |

## Common engineering paths

- Change CLI behavior: start at `src/cli/index.js`, the relevant `src/cli/commands/` file, and `test/cli.test.js`.
- Change lifecycle rules: read `.agents/schemas/artifact-scope.json`, `.agents/schemas/status-transitions.json`, `src/cli/commands/state.js`, templates, and validation tests together.
- Change viewer behavior: inspect `.delano/viewer/server.js`, `.delano/viewer/ui/src/app/`, the relevant page/domain module, and `test/viewer-server.test.js`.
- Change install/package contents: update `assets/install-manifest.json`, run `npm run build:assets`, then check package drift and package tests.
- Change canonical agent runtime: edit `.agents/`, synchronize `.claude/`, and verify mirror parity.

See the [Source map](source-map.md) for task-oriented navigation.

## Wiki sections

- [Architecture overview](architecture/overview.md) — components, boundaries, data flows, and historical rationale.
- [Domain concepts](domain/concepts.md) — contract hierarchy, statuses, dependencies, evidence, annotations, and handovers.
- [Engineering workflows](workflows/engineering.md) — install, planning/execution, review, editing, packaging, and release paths.
- [Operations and testing](operations-and-testing.md) — commands, quality gates, viewer runbook, safety, and troubleshooting.
- [Source map](source-map.md) — where to begin for each kind of change and integration.

## Current checkout note

At initialization, HEAD was `9fbe19b` and the checkout already contained uncommitted viewer UI, compiled asset, annotation-state, root instruction, and workflow changes. In particular, reader/detail/handover components and `.delano/viewer/public/assets/` were modified. Treat current viewer behavior as working-tree evidence, not necessarily released `0.3.1` behavior; do not overwrite or revert these local changes during unrelated work.
