---
type: research_findings
project: delano-strategy-layer
slug: strategy-artifact-design
created: 2026-07-23T23:01:31Z
updated: 2026-07-23T23:08:00Z
---

# Findings: Strategy artifact design and roadmap-to-project traceability

## Source References

- `src/cli/index.js` command dispatch table; `src/cli/commands/state.js`; `src/cli/lib/project-state.js` (`createProjectFromTemplates`, `setFrontmatter`, `renderTemplate`, rollup helpers).
- `.agents/scripts/pm/validate.sh` orchestration plus Node validators: `scripts/check-artifact-scope.mjs`, `scripts/check-artifact-schemas.mjs`, `scripts/check-status-transitions.mjs`, `scripts/check-operating-modes.mjs`.
- `.agents/schemas/artifact-scope.json`, `.agents/schemas/artifacts/*.schema.json`, `.agents/schemas/operating-modes.json`, `.agents/schemas/status-transitions.json`.
- Operating-modes rollout commits `52a5157` and `20ffea6` (the named precedent: schema + rule doc + validator + templates + CLI defaults + manifest + mirror + docs + tests).
- Viewer server `.delano/viewer/server.js` (`walkMarkdown`, `artifactRoleFor`, `loadIndex` fixed tiers, `docMeta`, `projectOutline`) and UI `.delano/viewer/ui/src/lib/domain/navigation.ts`, `.../pages/WorkspacePage.tsx`, `.../pages/DocumentReaderPage.tsx`.
- Packaging: `assets/install-manifest.json`, `scripts/build-npm-assets.mjs`, `scripts/check-package-manifest-drift.mjs`, `scripts/check-claude-mirror-parity.mjs`.
- Sync/interop constraints: `docs/spec-kit/import-contract.md`, `.project/registry/linear-map.json`, `scripts/check-local-sync-map.mjs`, `scripts/read-local-sync-map.mjs`.

## Observations

- CLI: command families register in a flat dispatch table in `src/cli/index.js`; a new `strategy`/`roadmap` family is one table entry plus one `commands/*.js` module. The JS-native pattern (`state.js` + `project-state.js`) fits better than the bash-wrapper pattern because the tier needs lifecycle logic and validation wiring, not just scaffolding.
- Promotion is cheap: `createProjectFromTemplates` is exported and callable in-process. The cleanest back-link mechanism is passing a `roadmap_item` token through `renderTemplate`'s replacement map, which requires adding a placeholder to `.project/templates/spec.md` (and optionally `plan.md`); the fallback is re-opening the written file with `loadMarkdownFile`/`setFrontmatter`.
- No frontmatter key conflicts: spec-kit import maps a fixed section list and ignores unknown keys; Linear/GitHub sync readers consume only a fixed key set (`linear_project_id`, `github_issue`, ...) and tolerate extra keys. `check-artifact-scope.mjs` checks required-field presence and never rejects unknown keys (except for `review`, which has strict JSON-schema validation).
- Validation: `validate.sh` orchestrates an inline Python base check (frontmatter, timestamps, task→workstream membership, depends_on cycles) plus ~25 Node validators. There is no generic cross-artifact reference resolver; each pair (task→workstream, task→task, task→project) is hand-coded. A project→roadmap-item check is new plumbing, best modeled on the task→workstream existence check or a new `check-roadmap-traceability.mjs` following the `check-operating-modes.mjs` walk pattern. Because `.project/strategy/` sits outside `.project/projects/<slug>/`, none of the existing walkers discover it for free; the tier needs its own walker.
- Artifact types do not self-register: `artifact-scope.json` lists 9 types, and `requiredArtifactTypes` in `check-artifact-scope.mjs` plus `KNOWN_ARTIFACT_KINDS` in `check-operating-modes.mjs` hardcode subsets. A new type needs the scope entry, a `.agents/schemas/artifacts/<type>.schema.json`, and updates to those hardcoded lists.
- Viewer: file discovery (`walkMarkdown`) is generic over `.project/**/*.md` and `/api/doc` serves any indexed path, but navigability is gated by three hardcoded allowlists: the server's `fixed` tier array (`context`, `templates`), the client's `WORKSPACE_NAV`, and the `artifactRoleFor` regex ladder. The `reviews/` tier is the precedent for adding a tier end-to-end; the `templates` tier is the cautionary precedent for "indexed but invisible" when UI wiring is skipped. Estimated ~5 files, ~30-60 lines for baseline navigable markdown rendering.
- Packaging footgun (confirmed, worse than the spec assumed): `assets/install-manifest.json` is a flat allowlist; `build-npm-assets.mjs` copies only listed files and `check-package-manifest-drift.mjs` compares manifest↔payload only. A new template missing from the manifest passes release validation and fails silently at install time (`Missing template` at `readTemplate`). A directory-vs-manifest drift check does not exist today and is a hardening candidate for this project's scope.
- `.claude/` is a byte-for-byte mirror of `.agents/` enforced by `check-claude-mirror-parity.mjs`; all strategy-tier rules/schemas/scripts must be authored in `.agents/` and synced.

## Options Considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| NC-001 single `strategy.md` with sections | One file, minimal scaffold | No per-item frontmatter, no addressable IDs, cross-reference validation must parse sections, viewer/docMeta plumbing is per-file | Rejected |
| NC-001 `vision.md` + `mission.md` + one file per roadmap item under `strategy/roadmap/RM-###-<slug>.md` | Mirrors task-file pattern; per-item status/frontmatter; ID→file resolution trivial; CLI lifecycle patching reuses `setFrontmatter` | More files; needs an ordering signal per item | Recommended |
| NC-002 time-based roadmap (quarters/dates) | Familiar planning idiom | Dates rot in file-backed repos; conflicts with tracker-agnostic design | Rejected |
| NC-002 horizon field (`now/next/later`) + lifecycle status reusing `planned/active/done/deferred` | Reuses canonical status set (NFR-002); horizon is a stable ordering signal; no new state machine | Coarse-grained ordering | Recommended |
| NC-003 required traceability once roadmap exists | Strong guarantee | Breaks legacy/adhoc projects; contradicts opt-in posture (AC-001/AC-006) | Rejected |
| NC-003 optional key, validated when present, written automatically by promote | Mirrors `operating_mode` rollout; zero legacy impact; SM-003 still enforceable | Direction-less projects stay possible (accepted) | Recommended |
| NC-005 one `delano strategy` family with nested roadmap subcommands | Single namespace | Diverges from flat family precedent (project/workstream/task are separate families) | Rejected |
| NC-005 `delano strategy` (init/show) + `delano roadmap` (add/promote/lifecycle/show) | Matches existing family granularity; roadmap gets the mutable surface | Two new table entries | Recommended |

## Fold-Forward Candidates

| Finding | Target Artifact | Proposed Change |
| --- | --- | --- |
| Technical unknowns U-001/U-002 resolved by inspection | `spec.md` | Record resolutions; flip probe decision to skipped with rationale (remaining uncertainty is product choice, not technical) |
| Recommended answers for NC-001/NC-002/NC-003/NC-005 | `spec.md`, `decisions.md` | Annotate NC items with recommendations; record proposed decisions pending owner approval |
| Silent manifest drift gap | `spec.md` scope | Add a templates-directory-vs-manifest drift check as an in-scope hardening item |
| Promotion mechanism (template token vs post-write patch) | `plan.md` (at planning) | Prefer template token `roadmap_item` placeholder in `spec.md`/`plan.md` templates |
| Viewer wiring checklist (index → role → nav → workspace page → hidden-slug sets) | `plan.md` (at planning) | Carry the 5-file change list into the viewer workstream to avoid the "indexed but invisible" regression |

## Open Questions

- NC-004 (vision/mission vs `PRODUCT.md`/`context/product-context.md`): recommendation is coexist-and-reference, but this is an owner taste call.
- NC-006 (should discovery-skill/`delano next` consume strategy context in v1): recommendation is read-only presence plus a discovery-skill runbook step; deferred integration otherwise.
- NC-007 (lifecycle for vision/mission): recommendation is minimal `active|superseded`; needs owner confirmation at spec approval.
