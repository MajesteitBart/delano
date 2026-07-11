# Engineering workflows

## 1. Entering the repository

Follow `AGENTS.md`:

1. Read the runtime-specific adapter in `.agents/adapters/<agent>/README.md`.
2. Inspect `git status --short --branch`, the relevant `.project/projects/<slug>/` contract, and intended source files.
3. Choose the smallest task-safe change.
4. Run the smallest meaningful validation.
5. Record evidence when scope/status/evidence changes.

Do not edit `.claude/` directly or revert unrelated working-tree changes. Browser/GUI checks are delegated through the repository’s Codex CLI rule (`.agents/rules/browser-delegation.md`).

## 2. Installing or updating Delano

The npm installer is allowlist-driven and conflict-first:

```bash
delano install --yes
# update-safe examples
delano install --only skills,project-templates --force --yes
delano install --no-project-state --force --yes
```

It plans all writes first. Existing paths block unless `--force` is explicit, and force cannot escape the packaged allowlist or bypass invalid parent paths. Avoid replacing consumer-owned `.project/context/`, `.project/projects/`, or `.project/registry/` during routine runtime refreshes.

After install, run `delano onboarding`; it requires approval before analyzing `AGENTS.md` and does not edit it. Replace starter context with real repository knowledge and validate.

## 3. Planning and executing delivery work

Prefer native lifecycle commands over hand-editing frontmatter:

```bash
delano project create <slug> --name "<name>" --owner <owner>
delano workstream add <slug> WS-A --name "<name>" --owner <owner>
delano task add <slug> T-001 --name "<name>" --workstream WS-A
delano task start <slug> T-001
delano update add <slug> --message "<progress>" --task T-001 --stream WS-A
delano task close <slug> T-001 --evidence "<proof>"
```

Creation renders `.project/templates/`; lifecycle actions patch existing files and apply scoped rollups. Run validation before handoff or closure because mutation commands do not run the entire validator.

Use `delano research <project> <research>` before changing executable contracts when intent, constraints, or external evidence are unclear. Findings must fold forward into canonical artifacts or close explicitly as no-action.

Use `delano import-spec-kit` only for the supported Markdown shape documented in `docs/spec-kit/import-contract.md`. Import is additive, creates planned/ready artifacts, refuses overwrite, and validates by default.

## 4. Using the viewer

Start locally:

```bash
npm run viewer
# or against an installed repo
delano viewer
```

The default starting address is `127.0.0.1:3977`; occupied ports advance automatically. The viewer indexes project, context, and template Markdown and derives navigation/status relationships.

Review workflow:

1. Open a contract and select text.
2. Save annotations; review state remains outside the Markdown contract.
3. Export feedback or hand it to an external agent.
4. Use start/review dispatch on task and workstream surfaces.
5. Watch SSE-backed activity for subsequent `.project` changes.
6. Validate and inspect resulting contract/evidence changes rather than treating dispatch as completion.

Editing workflow:

1. Enter edit mode (`E`, Ctrl/Cmd+E, or Edit).
2. Edit body content; frontmatter remains locked.
3. Review the normalization warning when applicable.
4. Save through guarded apply.
5. Resolve a 409 conflict explicitly by reloading theirs or keeping/reapplying yours.

The server accepts only known existing `.project` Markdown targets and checks path containment, hash freshness, and explicit confirmation. The service is unauthenticated; keep it local.

## 5. Changing viewer code

Trace changes across the correct layer:

- API/index/write/watch behavior: `.delano/viewer/server.js`
- fetch/state/navigation: `.delano/viewer/ui/src/app/`
- derived business rules: `.delano/viewer/ui/src/lib/domain/`
- page composition: `.delano/viewer/ui/src/pages/`
- editor/serialization: `.delano/viewer/ui/src/editor/`
- rendering/anchors/TOC: `.delano/viewer/ui/src/lib/markdown/` and `MarkdownArticle.tsx`

Then synchronize generated outputs:

```bash
npm --prefix .delano/viewer/ui run build
npm run build:assets
```

Do not manually patch only `.delano/viewer/public/assets/`; those files are compiled output. Conversely, `prepack` rebuilds the install payload but does not run Vite, so a source-only viewer change can otherwise ship stale assets.

## 6. Changing runtime policy

When changing schemas, statuses, templates, or lifecycle behavior, review together:

- `HANDBOOK.md` and `AGENTS.md`
- `.agents/schemas/`
- `.project/templates/`
- `src/cli/commands/state.js`
- relevant `.agents/scripts/pm/` validators/selectors
- `test/cli.test.js` and `test/package.test.js`

Edit canonical `.agents/` files, then:

```bash
npm run sync:claude-mirror
npm run check:claude-mirror
```

A status change is cross-cutting: artifact schemas, transition rules, scripts, templates, examples, fixtures, and tests may all encode it.

## 7. Packaging and release

Recommended sequence:

```bash
# if viewer UI changed
npm --prefix .delano/viewer/ui run build

npm run build:assets
npm run check:package-manifest
npm test
bash .agents/scripts/pm/validate.sh --release
npm pack --dry-run
```

`assets/install-manifest.json` controls install membership; root `package.json.files` controls the outer package. Package drift checks verify manifest sources, exact payload membership, provenance, and byte equality. Historical `.tgz` files in the repository are not the current package source of truth.
