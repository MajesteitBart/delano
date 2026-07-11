# Domain concepts

## Delivery hierarchy

Delano models a traceable path from business intent to proof:

```text
Outcome -> Spec -> Delivery project -> Workstreams -> Tasks -> Evidence -> Closeout/learning
                  \-> decisions, research, updates, external mappings
```

Canonical definitions come from `HANDBOOK.md`; executable fields and allowed values come from `.agents/schemas/` and `.project/templates/`.

- **Outcome:** measurable business result, not merely shipped output.
- **Spec:** product/delivery intent for one outcome; may require a time-boxed prototype probe before approval.
- **Delivery project:** bounded implementation dossier under `.project/projects/<slug>/`.
- **Workstream:** coherent implementation slice with ownership and conflict boundaries.
- **Task:** atomic, verifiable engineering unit with acceptance criteria and dependencies.
- **Evidence:** tests, review, release, or other proof required before closure.
- **Decision/update/research:** durable rationale, progress, and uncertainty-reduction artifacts that fold into canonical work.

## Artifact states

Allowed states differ by artifact (`.agents/schemas/artifact-scope.json`):

| Artifact | States |
| --- | --- |
| Spec | `planned`, `active`, `complete`, `deferred` |
| Plan/workstream | `planned`, `active`, `done`, `deferred` |
| Task | `planned`, `ready`, `in-progress`, `blocked`, `done`, `deferred` |

User-facing “Draft Spec” and “Approved Spec” correspond to `planned` and `active`. Several machine-readable policy files currently label themselves `status: draft`; that is policy maturity metadata, not an artifact lifecycle value.

A task is `ready` only when it is execution-eligible and local dependencies are done. `blocked` requires `blocked_owner` and `blocked_check_back`. Task closure requires evidence. See `.agents/schemas/status-transitions.json` for exact transition preconditions.

## Dependencies and scoped rollups

Tasks may declare local dependencies. `delano next` selects `ready` tasks with resolved dependencies and sorts candidates deterministically. Native task actions in `src/cli/commands/state.js` keep nearby hierarchy state aligned:

- starting a task can activate planned parent workstream/project contracts;
- closing a dependency can reopen dependency-only blocked dependents as `ready`;
- closing or deferring the last open task can close parent workstream/project state;
- reopening work can reopen compatible closed parents.

These are scoped conveniences, not a replacement for full validation. External-owner blockers are not automatically cleared.

## Operating modes and quality

`.agents/schemas/operating-modes.json` scales governance from a small patch through uncertain and multi-stream work. Higher modes require more explicit specs, plans, probes, coordination, and evidence. The skills under `.agents/skills/` map the lifecycle:

1. discovery
2. optional prototype probe
3. planning
4. breakdown
5. synchronization where applicable
6. execution
7. quality
8. closeout and learning

The completion rule in `AGENTS.md` is operationally important: implementation/contract changes, evidence, and understood working-tree state are all required. Report work as done, partial, or blocked.

## Source-of-truth precedence

- Process intent: `HANDBOOK.md`
- Delivery state: `.project/`
- Executable shared runtime: `.agents/`
- Compatibility mirror: `.claude/` (generated)
- Installation allowlist: `assets/install-manifest.json`
- Viewer UI: a projection and guarded interaction layer, not the delivery database
- External trackers: mapped/synchronized views, not default primary truth

When prose and runtime disagree, inspect CLI help, schemas, scripts, and tests, then correct the stale documentation or implementation deliberately.

## Viewer review concepts

**Annotation** is review feedback anchored to selected text and block/line metadata. It is stored in `.project/viewer/annotations.json`, separate from canonical Markdown. Body edits can make anchors stale; current behavior retains/flags rather than migrates them.

**Canonical apply** is the only viewer path that changes an existing `.project/**/*.md` contract. Preview shows the diff; apply requires the document hash and explicit confirmation. Frontmatter is locked in the editor and reattached byte-identically.

**Handover** transfers context to an external coding agent. It supports three intents:

- `annotations`: resolve selected feedback;
- `start`: implement a task or workstream contract;
- `review`: verify acceptance criteria and evidence, optionally carrying feedback.

Handover does not grant permissions or silently modify canonical contracts. Annotation handovers are materialized under `.project/viewer/handovers/`; direct start dispatch can reference the contract without creating a handover file.

**Activity** is recent `.project` filesystem change telemetry streamed over SSE. The 200-event server buffer is restart-ephemeral; persistent truth remains in files.

## External synchronization

Registry and sync contracts support stable local/remote IDs, drift classification, inspection, and repair planning. GitHub and Linear tools are primarily fixture-backed or inspect-first in the default runtime. Remote mutations, force installs, public actions, and tracker writes require explicit approval. Do not infer that the existence of `linear_issue_id` fields means live Linear sync is configured.
