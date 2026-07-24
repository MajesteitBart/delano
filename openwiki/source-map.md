# Source map

Use this page to find the smallest authoritative source set for a change.

## Product and process

| Question | Start here | Continue with |
| --- | --- | --- |
| What is Delano for? | `README.md`, `PRODUCT.md` | `HANDBOOK.md` sections 1–6 |
| What must an agent do? | `AGENTS.md` | `.agents/adapters/<agent>/README.md`, `.agents/rules/` |
| What is the canonical workflow? | `HANDBOOK.md` | `.agents/skills/*/SKILL.md` |
| How do users operate it? | `docs/README.md` | `docs/user-guide.md`, `docs/cli-reference.md`, `docs/viewer-guide.md` |

## CLI

| Area | Primary sources | Tests/checks |
| --- | --- | --- |
| Entrypoint and dispatch | `bin/delano.js`, `src/cli/index.js` | `test/cli.test.js` |
| Install planning/application | `src/cli/commands/install.js`, `src/cli/lib/install.js` | CLI and package tests |
| Project/workstream/task/update lifecycle | `src/cli/commands/state.js`, `src/cli/lib/project-state.js` | CLI tests; status-transition checks |
| Roadmap lifecycle and promotion | `src/cli/commands/roadmap.js`, `src/cli/lib/roadmap-state.js`, `src/cli/lib/roadmap-projection.js` | roadmap CLI, projection, contract, and package tests |
| Context packs | `src/cli/commands/context.js`, `src/cli/lib/context-reader.js` | CLI context safety tests |
| Viewer launch | `src/cli/commands/viewer.js` | CLI launch tests; viewer server tests |
| Bash wrappers | `src/cli/commands/wrapper.js`, `src/cli/lib/pm.js` | relevant PM script and CLI tests |

## Delivery runtime and data model

| Area | Primary sources |
| --- | --- |
| Artifact fields and statuses | `.agents/schemas/artifact-scope.json`, `.agents/schemas/artifacts/` |
| Transitions/dependencies | `.agents/schemas/status-transitions.json`, `.agents/scripts/check-status-transitions.mjs` |
| Operating modes | `.agents/schemas/operating-modes.json`, `.agents/rules/delivery-modes.md` |
| Evidence and quality | `.agents/schemas/evidence-map.json`, `.agents/skills/quality-skill/` |
| Artifact creation | `.project/templates/` |
| Project instances | `.project/projects/<slug>/` |
| Portfolio status/selection | `.agents/scripts/pm/status.sh`, `.agents/scripts/pm/next.sh`, `.agents/scripts/select-next-task.mjs` |
| Context knowledge | `.project/context/` and `src/cli/lib/context-reader.js` |
| Strategy contracts and traceability | `.project/roadmap/`, `.agents/rules/roadmap.md`, roadmap schema/checker, project spec `roadmap_item` |

Lifecycle changes usually cross schemas, templates, CLI mutation code, PM scripts, docs, fixtures, and tests. Search all of them before editing.

## Viewer

| Area | Primary sources | Notes |
| --- | --- | --- |
| HTTP/API/index/write guards | `.delano/viewer/server.js` | Dependency-free server; source of API truth. |
| UI composition | `.delano/viewer/ui/src/App.tsx`, `src/pages/` | State-driven routes. |
| Fetching/live state | `.delano/viewer/ui/src/app/` | Index, document, SSE, navigation, viewport. |
| Domain derivation | `.delano/viewer/ui/src/lib/domain/` | Keep business derivation out of page components. |
| Roadmap board/actions | `src/lib/domain/roadmap.ts`, `roadmap-actions.ts`, `src/pages/roadmap/` | Capability-gated projection and guarded mutations. |
| Markdown read rendering | `src/lib/markdown/`, `MarkdownArticle.tsx` | Annotation anchors depend on block/line behavior. |
| Editing | `src/editor/DocumentEditor.tsx`, `markdownEditing.ts`, `slashCommands.js` | Frontmatter locked; apply API reused. |
| Annotations/review | `AnnotationPopover.tsx`, `AnnotationDrawer.tsx`, `annotations.ts` | Stored outside canonical contracts. |
| Handover/dispatch | `HandoverMenu.tsx`, `AgentSplitButton.tsx`, `useHandoverAgent.ts`, `handover.ts`, server endpoint | External agents retain their own permissions. |
| Compiled runtime | `.delano/viewer/public/` | Generated; rebuild from UI source. |
| Integration tests | `test/viewer-server.test.js` | API/SSE/write safety. |

For rationale, inspect `.project/projects/015-delano-viewer-annotations-agent-chat/` and `.project/projects/016-viewer-openknowledge-parity/`, especially `decisions.md`, `spec.md`, and recent `updates/`.

## Packaging and installation

| Boundary | Source |
| --- | --- |
| npm metadata and outer shipped files | `package.json` |
| install allowlist | `assets/install-manifest.json` |
| generated installation payload | `assets/payload/` |
| payload builder | `scripts/build-npm-assets.mjs` |
| drift checker | `scripts/check-package-manifest-drift.mjs` |
| legacy migration installer | `install-delano.sh` |
| package verification | `test/package.test.js` |

Remember: Vite build, compiled viewer assets, generated payload, and npm pack are separate steps.

## Integrations

- Agent adapters: `.agents/adapters/`; canonical shared behavior belongs in `.agents/`.
- Claude compatibility: `scripts/sync-claude-mirror.mjs` and parity checker.
- Codex hooks: `.agents/hooks/` plus merge behavior in `src/cli/lib/install.js`.
- GitHub/Linear: `.agents/schemas/sync/`, `.project/registry/`, inspection/drift/repair scripts and fixtures.
- Spec Kit: `.agents/scripts/pm/import-spec-kit.sh`, `docs/spec-kit/import-contract.md`, fixtures/tests.
- Research intake: `.agents/scripts/pm/research.sh`, `.agents/skills/research-skill/`, project `research/` folders.
- Multi-agent coordination: lease, conflict, worktree, and handoff scripts under `.agents/scripts/`.

## Generated or mirrored paths

Do not treat these as independent sources:

- `.claude/` mirrors `.agents/`.
- `.delano/viewer/public/` is built from `.delano/viewer/ui/`.
- `assets/payload/` is built from manifest-listed repository sources.
- `.project/viewer/annotations.json` is mutable review/audit state, not a product schema definition.

## Git history guide

Use recent history selectively:

```bash
git log --oneline -- <path>
git show <commit> -- <path>
git blame -L <start>,<end> <path>
```

High-signal historical themes are native state-command introduction, status-contract tightening, the viewer chat-to-handover pivot, guarded editing/live activity, and packaging/test hardening. Prefer project decisions and current source over commit-message inference when they disagree.
