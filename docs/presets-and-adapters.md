# Delano Presets and Adapter Manifest Model

## Purpose

Delano presets and adapters should make the runtime easier to adopt without weakening the conservative install and delivery contracts.

This model separates two concerns:

- **Adapters** describe how a specific agent or external authoring tool should interact with Delano.
- **Presets** describe a safe bundle of install categories, templates, commands, and validation expectations for a workflow mode.

The model is intentionally declarative first. A manifest can be inspected, validated, and reviewed before any command writes files.

## Non-negotiable constraints

- `.project` remains the source of truth for delivery state.
- Install/update behavior remains conflict-first.
- Presets must use existing allowlist categories or explicitly proposed categories.
- No preset may silently overwrite repo-owned project state.
- External sync writes still require Delano sync semantics, dry-run repair, and operator approval.
- Adapter metadata must not require private local paths, vaults, tokens, or machine-specific runtimes.

## Adapter manifest shape

Adapter manifests live under:

```text
.agents/adapters/<adapter-id>/adapter.json
```

A reusable schema proposal lives at:

```text
.agents/adapters/manifest.schema.json
```

Fields:

| Field | Required | Purpose |
| --- | --- | --- |
| `id` | yes | Stable kebab-case adapter id. |
| `name` | yes | Human-readable adapter name. |
| `type` | yes | `agent`, `authoring-tool`, `sync-tool`, or `workflow`. |
| `owner` | yes | Responsible maintainer/team. |
| `status` | yes | `proposed`, `experimental`, `stable`, or `deprecated`. |
| `summary` | yes | Short description of the adapter's purpose. |
| `commands` | yes | Supported Delano or adapter commands. |
| `generated_files` | yes | Files the adapter may create or modify. |
| `validation` | yes | Checks required before handoff. |
| `install` | yes | Install categories and conflict policy. |
| `limits` | yes | Explicit non-goals and safety limits. |

## Command entry shape

Each command entry should include:

| Field | Purpose |
| --- | --- |
| `name` | Stable command name. |
| `description` | What the command does. |
| `input` | Required and optional arguments. |
| `output` | Human and JSON output expectations. |
| `writes` | Files or directories the command may write. |
| `validation` | Checks run by default or required afterward. |

Agent-facing commands should prefer:

- named options over ambiguous optional positional arguments;
- `--json` for parseable output;
- refusal to overwrite existing project folders unless an explicit safe mode exists;
- concise human summaries plus validation status;
- non-zero exits and structured JSON errors on failure when possible.

## Generated file declarations

Generated file declarations make conflicts reviewable before writes happen.

Each generated file entry should include:

| Field | Purpose |
| --- | --- |
| `path` | Target path or glob. |
| `owner` | Which adapter/preset owns the generated artifact. |
| `mode` | `create-only`, `update-owned`, `proposal-only`, or `never-overwrite`. |
| `conflict_behavior` | `abort`, `diff-required`, or `operator-approval-required`. |
| `fold_forward` | Canonical Delano artifact where findings or generated intent must land. |

## Validation expectations

Every adapter/preset should declare validation expectations:

- Delano validation: `delano validate` or `.agents/scripts/pm/validate.sh`.
- Text safety: `npm run check:text-safety` for Delano repo changes.
- Tests: `npm test` when runtime code changes.
- Fixture checks for import/generation behavior.
- Optional viewer smoke inspection when UI-visible artifacts change.

## Example preset: Spec Kit interop

Purpose: allow Spec Kit-style authoring artifacts to feed Delano-governed delivery.

Recommended bundle:

```json
{
  "id": "spec-kit-interop",
  "label": "Spec Kit interop",
  "install_categories": ["agent-runtime", "project-templates", "skills"],
  "commands": ["delano import-spec-kit", "delano research", "delano validate"],
  "conflict_policy": "abort unless target paths are new or operator approves a diff",
  "validation": ["delano validate", "fixture import smoke"]
}
```

Expected use:

1. Import or author intent.
2. Open research intake for unclear parts.
3. Fold findings into `spec.md`, `plan.md`, workstreams, and tasks.
4. Execute under Delano evidence gates.

## Example preset: Prototype-first delivery

Purpose: force uncertainty through a probe before execution work expands.

Recommended bundle:

```json
{
  "id": "prototype-first",
  "label": "Prototype-first delivery",
  "install_categories": ["agent-runtime", "project-templates", "skills", "viewer"],
  "commands": ["delano init", "delano research", "delano validate", "delano viewer"],
  "conflict_policy": "preserve project state by default; generated probe artifacts are create-only",
  "validation": ["delano validate", "probe evidence recorded", "task evidence map"]
}
```

Expected use:

1. Create a project scaffold.
2. Record explicit probe decision.
3. Use research intake for unknowns.
4. Run a probe and fold findings into the delivery plan.
5. Only then expand implementation tasks.

## Example preset: Enterprise audit

Purpose: maximize evidence and sync review for regulated or high-risk environments.

Recommended bundle:

```json
{
  "id": "enterprise-audit",
  "label": "Enterprise audit",
  "install_categories": ["agent-runtime", "project-templates", "project-context", "viewer"],
  "commands": ["delano validate", "delano status", "delano next", "delano viewer"],
  "conflict_policy": "never overwrite project state without operator-approved diff",
  "validation": ["delano validate", "sync dry-run", "evidence map", "handoff summary"]
}
```

Expected use:

1. Keep generated intent as proposals until reviewed.
2. Require evidence before closure.
3. Use dry-run sync reports before external writes.
4. Preserve closeout learning and audit trails.

## Install/update conflict behavior

Presets must compile down to existing Delano install behavior:

- `only`: explicit allowlist categories to install/update.
- `exclude`: categories to preserve.
- `force`: whether allowlisted files may be overwritten.
- `interactive`: whether the operator chooses categories.

If a preset wants to write outside current categories, it should first propose a new install category and manifest entries. It should not write arbitrary files outside the allowlist.

Conflict policy mapping:

| Preset policy | Delano install behavior |
| --- | --- |
| Preserve project state | exclude `project-context`, `project-projects`, and `project-registry`. |
| Update skills/templates only | only `skills` and `project-templates`; force allowed. |
| Full repair | all categories; force only after operator approval. |
| Proposal-only | write update/proposal notes, not canonical files. |

## Compatibility with existing install presets

Current Delano install presets are still valid:

- `update-safe`
- `skills-templates`
- `full`
- `custom`

Workflow presets should not replace them immediately. Instead, workflow presets can be documented as higher-level recipes that choose install presets and commands.

## Future implementation path

1. Keep this model documented and fixture-backed.
2. Add adapter manifests for current built-in adapters.
3. Add schema validation for adapter manifests.
4. Add `delano preset list` and `delano preset explain <id>` before any preset apply command.
5. Only add `delano preset apply <id>` after conflict previews and dry-run output are reliable.

The safe order matters: explanation and validation first, writes last.
