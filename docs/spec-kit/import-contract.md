# Spec Kit Artifact Import Contract

## Purpose

This contract defines the first Delano-compatible shape for importing Spec Kit-style intent artifacts into Delano `.project` delivery contracts.

The goal is not to clone Spec Kit. The goal is to let authoring-first artifacts feed Delano while preserving Delano's delivery guarantees:

- `.project` remains the execution source of truth.
- Imported content is normalized before it becomes work.
- Validation, evidence, dependency, sync, multi-agent, and closeout rules still apply.
- Private local tools, paths, vaults, and agent runtimes are never required.

## Import posture

Import is conservative by default.

A Delano importer or agent workflow should:

1. Read one or more upstream intent artifacts.
2. Classify the artifact type and confidence.
3. Produce a proposed mapping into Delano files.
4. Preserve unsupported or ambiguous content as clarification notes, not executable tasks.
5. Show a diff or summary before overwriting existing repo-owned state.
6. Run Delano validation after writing files.

An import may create a new project or update a draft/planned project, but it must not mark tasks `done`, specs `complete`, or plans `done`.

## Accepted first fixture shape

The first supported fixture is a single markdown document containing these sections:

- `# Specification: <name>` or `# Spec: <name>`
- `## User Stories`
- `## Acceptance Scenarios`
- `## Requirements`
- `## Non-Functional Requirements`
- `## Assumptions`
- `## Clarifications` or `## Needs Clarification`
- `## Implementation Plan`
- `## Tasks`

This is intentionally narrow. It is enough to prove the end-to-end path without committing Delano to every Spec Kit output variant at once.

A sample fixture lives at `docs/spec-kit/fixtures/minimal-spec-kit-project.md`.

## Target Delano files

Given a target slug `<slug>`, imported content maps into:

```text
.project/projects/<slug>/
  spec.md
  plan.md
  decisions.md
  tasks/
    T-001-...
  workstreams/
    WS-A-...
  updates/
    <date>-imported-from-spec-kit.md
```

The importer may also create a temporary proposal file before writing canonical contracts, for example:

```text
.project/projects/<slug>/updates/<date>-spec-kit-import-proposal.md
```

The proposal file is optional. The canonical files above are not optional once import is accepted.

## Field mapping

### Project identity

| Upstream field | Delano target | Notes |
| --- | --- | --- |
| Spec title | `spec.md` frontmatter `name` and heading | Normalize whitespace. Do not infer a brand-new product name if the title is vague. |
| Requested slug or generated slug | `spec.md` frontmatter `slug` and project folder | Must be kebab-case. If ambiguous, require clarification. |
| Author/owner if present | `spec.md` `owner`, `plan.md` `lead` | Default to `team` only for scaffolding. |
| Creation/import timestamp | `created`, `updated` | Use real UTC timestamps. |

### Spec content

| Upstream section | Delano target | Notes |
| --- | --- | --- |
| Summary / overview | `spec.md` `Executive Summary` | Keep concise. |
| User stories | `Problem and Users`, `Functional Requirements` | Preserve story identifiers if present. |
| Acceptance scenarios | `Outcome and Success Metrics`, task acceptance criteria | Scenario IDs should remain traceable. |
| Requirements | `Functional Requirements` | Split ambiguous items into clarification notes. |
| Non-functional requirements | `Non-Functional Requirements` | Preserve security, performance, privacy, compatibility, and operational requirements. |
| Assumptions | `Hypotheses and Unknowns` | Assumptions are not facts until validated. |
| Needs clarification | `Remaining Unknowns`, `Approval Notes` | Must not become executable work without a decision. |
| External dependencies | `Dependencies` | Include only portable references. |

### Plan content

| Upstream section | Delano target | Notes |
| --- | --- | --- |
| Technical plan | `plan.md` `Architecture Decisions` | Label imported decisions as proposed until reviewed. |
| Complexity / risk notes | `plan.md` `Remaining Delivery Risks` | Do not suppress risks during import. |
| Rollout notes | `plan.md` `Rollout Strategy` | If absent, leave explicit TODO/unknown. |
| Testing notes | `plan.md` `Test Strategy` | Must connect to validation gates where possible. |
| Rollback notes | `plan.md` `Rollback Strategy` | If absent, record as a gap. |

### Tasks

| Upstream item | Delano target | Notes |
| --- | --- | --- |
| Ordered task list | `tasks/T-###-*.md` | Preserve order unless dependencies require reshaping. |
| `[P]` or parallel marker | task frontmatter `parallel: true` | Still require `conflicts_with` and workstream ownership review. |
| Story/task association | task body `Technical Notes` | Future template work may add formal `story_id` fields. |
| Dependencies | task frontmatter `depends_on` | Local dependency IDs must be acyclic. |
| Implementation notes | task `Technical Notes` | Keep as guidance, not acceptance criteria. |
| Acceptance criteria | task `Acceptance Criteria` | Every generated task needs at least one checkable criterion. |

### Workstreams

Spec Kit-style outputs may not contain workstreams. Delano import should infer workstreams conservatively from task clusters:

- `WS-A` for authoring/import or foundation work.
- `WS-B` for contract/template work.
- `WS-C` for validation/test work.
- Additional streams only when ownership or conflict zones are meaningfully different.

If the importer cannot infer workstreams safely, create one `WS-A` workstream and record the uncertainty in the import update.

## Status rules

Imported artifacts should start in non-terminal states:

- `spec.md`: `planned`
- `plan.md`: `planned`
- independent tasks: `ready`
- dependent tasks with unresolved prerequisites: `blocked` with `blocked_owner` and `blocked_check_back`
- workstreams: `planned`

Import must not produce:

- `done` tasks;
- `complete` specs;
- `done` plans;
- `active` specs when probe fields or clarification gates are unresolved.

## Clarification and unsupported content

Unsupported or ambiguous content must be preserved, but not executed.

Use these handling rules:

| Condition | Handling |
| --- | --- |
| Missing project outcome | Put in `Remaining Unknowns`; require clarification before activation. |
| Vague task without acceptance criteria | Convert to clarification note or blocked task, not `ready`. |
| Conflicting requirements | Record in `Approval Notes` and import update. |
| External issue links without identity map | Preserve as text; do not populate sync fields until verified. |
| Private local paths or machine-specific references | Drop or generalize; record that they were excluded. |
| Secrets, tokens, credentials | Never import. Record only that sensitive content was omitted. |
| Agent-specific prompt fragments | Preserve only durable requirements and decisions. |

## Validation requirements

A successful import must provide evidence that:

- `delano validate` passes.
- Generated task dependency graph is acyclic.
- No absolute path leakage is introduced.
- Blocked tasks include `blocked_owner` and `blocked_check_back`.
- Text safety checks pass for generated markdown.
- The import update records source artifact type, import time, and unresolved clarifications.

## Non-goals for the first importer

The first implementation does not need to support:

- every Spec Kit template variant;
- live GitHub API reads;
- automatic Linear/GitHub issue creation;
- multi-file Spec Kit workspaces;
- automatic implementation execution;
- private Obsidian/OpenClaw bridges;
- overwriting active Delano projects without an explicit diff and approval.

## First probe recommendation

The first probe should implement or simulate this path:

1. Read `docs/spec-kit/fixtures/minimal-spec-kit-project.md`.
2. Create a new Delano project under `.project/projects/<slug>/`.
3. Generate `spec.md`, `plan.md`, one or more workstreams, and tasks.
4. Put dependent tasks into `blocked` with required blocker metadata.
5. Write an import update note.
6. Run `delano validate`.

That probe is the acceptance gate for expanding from a documented contract into a supported command or script.
