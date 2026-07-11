# Operations and testing

## Command matrix

| Change surface | Minimum useful checks | Additional release/high-risk checks |
| --- | --- | --- |
| CLI dispatch/arguments | `node --test test/cli.test.js` | `npm test` |
| Contract schemas/statuses/templates | targeted `npm run check:*`; `node --test test/package.test.js` | `bash .agents/scripts/pm/validate.sh --release` |
| Viewer server/API | `node --test test/viewer-server.test.js` | full `npm test`; manual local smoke |
| Viewer UI/domain/editor | UI typecheck/lint/focused tests; Vite build | server tests, package tests, browser smoke |
| `.agents/` canonical runtime | relevant checker + `npm run check:claude-mirror` | full validation and package drift |
| Install manifest/package | `npm run build:assets`; `npm run check:package-manifest` | `npm pack --dry-run`; release validation |

Root `npm test` runs Node’s test runner over `test/`, covering CLI, package/runtime, and viewer server integration. It does **not** automatically run all viewer UI typechecks, lint, focused `.mjs` tests, probes, or the Vite build.

## Test ownership

- `test/cli.test.js`: command dispatch, native state creation/mutation/rollups, install planning/conflicts, context safety, Codex hook merge, import/research behavior.
- `test/package.test.js`: packed contents, payload drift, schemas, statuses/transitions, strict fixtures, sync/lease/metrics contracts.
- `test/viewer-server.test.js`: API safety, annotation CRUD/export, apply preview/hash conflicts, body limits/corrupt stores, handovers, SSE/activity, shutdown.
- `.delano/viewer/ui/src/editor/slashCommands.test.mjs`: slash-command behavior; deliberately dependency-free for Node 20 compatibility.
- `.delano/viewer/ui/src/components/organisms/documentDetails.test.mjs`: reader/task details.
- `.delano/viewer/ui/scripts/check-domain.cjs`: UI domain-boundary checks.
- `.delano/viewer/ui/scripts/roundtrip-probe.mjs`, `watch-probe.mjs`: serializer corpus and watcher reliability probes.

Use the focused check first, then widen based on shared boundaries. Record skipped checks and why.

## Validation profiles

```bash
# Contracts/runtime; expected to pass on a fresh clone
bash .agents/scripts/pm/validate.sh
# Release adds package payload drift checks
bash .agents/scripts/pm/validate.sh --release
```

The root `package.json` exposes granular checks for package manifests, agent entry docs, artifact scope/schemas, operating modes, transitions, evidence, fixtures, sync, leases, worktrees, text safety, metrics, context, skills, Spec Kit, adapters, and mirror parity. Prefer a targeted checker while iterating.

## Viewer runbook

```bash
npm run viewer
DELANO_VIEWER_PORT=3987 npm run viewer
```

- Binds to loopback and starts at port 3977 unless overridden.
- Tries later ports if the requested port is busy and prints the actual URL.
- Watches `.project` recursively; SSE heartbeats run every 25 seconds.
- Activity holds at most 200 in-memory events and resets on restart.
- Annotations/audit are persistent in `.project/viewer/annotations.json`; handover files are under `.project/viewer/handovers/`.
- Request bodies are limited to 512 KiB.

Troubleshooting:

- **Viewer source changed but UI appears stale:** rebuild `.delano/viewer/ui`, then refresh compiled assets and package payload.
- **Apply returns 409:** the file changed since load; compare/reload rather than bypassing the expected hash.
- **Annotation storage is malformed:** server fails closed; repair deliberately from version control or a known backup instead of overwriting it blindly.
- **No live refresh:** inspect watcher/SSE behavior and run the watcher probe; do not assume individual Windows event paths are reliable.
- **Annotation highlight no longer matches:** body edits can stale anchors; current design flags/retains rather than migrates them.

## Packaging runbook

```bash
npm --prefix .delano/viewer/ui run build   # when UI changed
npm run build:assets
npm run check:package-manifest
npm pack --dry-run
```

`build:assets` deletes and reconstructs `assets/payload/` from `assets/install-manifest.json`. The manifest and payload are generated/distribution boundaries, while consumer `.project` data is repository-owned. Never “fix” drift by copying arbitrary files into the payload outside the manifest.

## Safety and operational boundaries

- Do not expose the viewer as an authenticated multi-user service; it has no auth layer.
- Canonical viewer writes use containment, corpus membership, hash, and confirmation guards, but the final filesystem write is synchronous rather than temp-file/rename transactional.
- Keep raw prompt logging opt-in and committed logs privacy-safe.
- Do not leak local absolute paths into docs, contracts, JSON output, or hooks.
- Confirm remote GitHub/Linear writes, public actions, destructive Git operations, and force installs.
- Treat `.claude/` as generated and `.delano/viewer/public/` plus `assets/payload/` as build outputs.
- Understand the dirty working tree before validation or packaging. Current initialization found modified viewer source/assets and annotation state.

## Runtime caveats

- `package.json` declares Node >=18, but Bash and Python are needed for important wrapper and validation paths.
- Native state commands do not automatically run full validation.
- The npm installer and legacy `install-delano.sh` have different semantics; prefer the npm allowlist path unless testing migration compatibility.
- Linear fields and registries do not imply live Linear connectivity.
