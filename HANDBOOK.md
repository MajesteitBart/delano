# Delano handbook

Version: 3.5. Updated: 2026-09-12.

Covers the `@bvdm/delano` 0.4.0 CLI and the Delano Agent Plugin 0.1.0 source package.

Delano keeps delivery decisions and evidence in a repository. A spec records the intended outcome, a plan explains the approach, and tasks record what changed and how it was checked. Those files let another person or agent pick up the work without reconstructing it from a conversation.

Use the parts that fit the work. A feature needs discovery, a plan, and verifiable tasks. A small correction usually needs an existing task or update note. Research, prototypes, workstreams, tracker sync, and roadmap items have specific uses; add them when those uses apply.

## How to read the rules

- `[enforced]` means a validator or command checks the stated condition. Enforcement requires the relevant tooling to be installed and run.
- `[policy]` means the operator or reviewer must check it. A successful command does not establish compliance.
- `[guidance]` means a recommendation that can be adapted without a waiver. Untagged advice is guidance.

The portable plugin supplies instructions and templates. Run the CLI's validators separately when available. Keep enforcement claims precise: checking that evidence text exists is different from verifying the work it describes.

Read [AGENTS.md](AGENTS.md) for this repository's working instructions. The user's directions take precedence over skill guidelines. Use authorization already given in the conversation across the lifecycle stages it covers.

## Contents

- [Files and ownership](#files-and-ownership)
- [Delivery workflow](#delivery-workflow)
- [File contracts](#file-contracts)
- [Operating modes](#operating-modes)
- [Status and closure](#status-and-closure)
- [Quality and evidence](#quality-and-evidence)
- [Optional strategy and roadmap](#optional-strategy-and-roadmap)
- [Parallel work](#parallel-work)
- [Linear and GitHub](#linear-and-github)
- [CLI, validation, and viewer](#cli-validation-and-viewer)
- [Context and responsibilities](#context-and-responsibilities)
- [Installation, refresh, and migration](#installation-refresh-and-migration)
- [Templates](#templates)

## Files and ownership

`.project/` holds delivery state. Keep the outcome, scope, dependencies, decisions, and verification results there. A tracker, viewer, or conversation can expose this state, but changes to delivery commitments belong in the relevant contract.

```text
.project/
  context/                       Shared repository knowledge
    vision.md                    Optional long-term direction
    mission.md                   Optional purpose and audience
  roadmap/                       Optional strategic priorities
    RM-001-<slug>.md
  projects/<project-slug>/
    spec.md
    plan.md
    decisions.md
    workstreams/WS-A-<name>.md
    tasks/T-001-<name>.md
    updates/<date>-<short-title>.md
    research/<research-slug>/
  reviews/                       Explicitly published reviews
  templates/                     Repository-owned artifact templates
  registry/                      Mappings for adopted integrations
```

Create directories as the work needs them.

| Surface | Responsibility |
| --- | --- |
| `.project/projects/` | Project intent, implementation plans, tasks, decisions, and evidence. |
| `.project/context/` | Knowledge that remains useful across projects. |
| `plugins/delano/` | Portable skills, references, and bundled templates. Delivery output goes in the target repository. |
| CLI package | Lifecycle commands, installation, and the executable viewer. |
| `.agents/` in CLI runtime installations | Scripts, schemas, rules, hooks, and runtime-specific adapters. |
| `.claude/` in older installations | Generated compatibility copy of `.agents/`; edit its source and regenerate it. |
| Viewer local storage | Unpublished drafts and machine-specific state. |

The portable package works without a repository-installed `.agents` or `.claude` tree. Existing CLI commands still depend on those runtime files.

`[policy]` Preserve repository-owned context, contracts, history, and local edits during updates. Shared documents use repository-relative paths. Keep credentials, raw prompts, personal data, and local machine paths out of committed logs and evidence. Raw prompt logging is opt-in.

## Delivery workflow

Start by reading the current contract and inspecting the working tree. Decide which uncertainty or delivery step needs work, then use the matching skill. Continue an existing task when it already covers the change.

The portable package contains all ten lifecycle skills:

| Skill | Use it when | Record |
| --- | --- | --- |
| [Discovery](plugins/delano/skills/discovery-skill/SKILL.md) | The problem, outcome, or scope needs definition. | Spec with a measurable target and probe decision. |
| [Research](plugins/delano/skills/research-skill/SKILL.md) | A specific question needs evidence before a decision. | Findings and their effect on the contract. |
| [Prototype](plugins/delano/skills/prototype-skill/SKILL.md) | A material technical or product assumption needs an experiment. | Observations, limits, and a recommendation in the spec. |
| [Planning](plugins/delano/skills/planning-skill/SKILL.md) | The outcome is clear enough to choose an approach. | Architecture, sequence, verification, rollout, and rollback. |
| [Breakdown](plugins/delano/skills/breakdown-skill/SKILL.md) | Planned work needs executable tasks. | Acceptance criteria, dependencies, and work ownership. |
| [Execution](plugins/delano/skills/execution-skill/SKILL.md) | An authorized task is ready. | Implementation and observed progress. |
| [Quality](plugins/delano/skills/quality-skill/SKILL.md) | Acceptance or release readiness needs verification. | Results, missing evidence, and unresolved defects. |
| [Sync](plugins/delano/skills/sync-skill/SKILL.md) | Local contracts and tracker state need reconciliation. | Comparison and an authorized repair, if needed. |
| [Closeout](plugins/delano/skills/closeout-skill/SKILL.md) | Work is ready for an outcome review and status reconciliation. | Closure evidence and disposition of remaining work. |
| [Learning](plugins/delano/skills/learning-skill/SKILL.md) | Delivery experience suggests a useful process change. | A specific improvement supported by an observed problem. |

### Define the outcome

`[policy]` Give each spec one measurable outcome. Identify the affected user, the problem, the success signal, and the scope boundary. Write acceptance scenarios that a reviewer can observe. Separate known facts from assumptions and questions that still matter to the decision.

Decide whether a prototype is needed. A useful probe tests one consequential unknown within a time limit. State what result would support or reject the approach, exercise the relevant touchpoints, and record what happened. Include failed attempts and remaining uncertainty.

`[policy]` Resolve required probe findings before activating the spec. When skipping a probe, record the reason. Check that the activation decision is covered by the user's authorization.

### Research before committing to an uncertain approach

For substantial research, use `.project/projects/<project-slug>/research/<research-slug>/`:

| File | Purpose |
| --- | --- |
| `task_plan.md` | Question, scope, approach, and progress through the investigation. |
| `findings.md` | Sources, observations, conclusions, and uncertainty. |
| `progress.md` | What was tried, what changed, and the next useful step. |

`[policy]` Research becomes delivery state only when its conclusions are incorporated into the spec, plan, decisions, or tasks. Link the change to its evidence. If the findings require no action, record that conclusion and why.

Spec Kit import is another intake path. The current importer accepts its documented source shape, creates planned contracts, and avoids overwriting existing work. Review the result before execution. See [Spec Kit and research](docs/spec-kit-and-research.md) and the [import contract](docs/spec-kit/import-contract.md).

### Plan and break down the work

Explain the approach, constraints, risks, and tradeoffs in `plan.md`. Record decisions worth preserving in `decisions.md`, keeping superseded decisions and their history. Include the checks that will establish acceptance and the rollout or rollback needed for the change.

Use workstreams to define ownership where coordination is needed. Each workstream identifies its objective, owned files or areas, dependencies, risks, and handoff conditions.

`[policy]` A task should produce one reviewable change with binary acceptance criteria. Aim for work that can be completed and verified in one focused session, roughly a day at most. Split tasks when their outcomes can be verified independently. Keep inseparable implementation and verification together.

Before opening a task as ready, check its scope, workstream, prerequisites, acceptance criteria, and likely file conflicts. Record the reason for dependencies. Apply the [parallel work criteria](#parallel-work) before marking a task as suitable for concurrent execution.

### Execute and verify

Select ready work whose dependencies are done. Inspect the files before changing them, stay within the agreed scope, and record evidence as work proceeds. If the implementation changes a commitment or invalidates the plan, update the relevant contract.

When blocked, record the cause, owner, check-back time, and next action. Continue independent authorized work where possible. Do not hide a blocker by marking the task done or deferring it without a scope decision.

Run checks that address the changed behavior and risk. Review acceptance against the results before closing the task. The [quality rules](#quality-and-evidence) apply even when the CLI accepts the close command.

### Close the loop

`[policy]` Before completing a spec, compare the result with its outcome and success criteria. Resolve remaining tasks, document any agreed deferrals, and inspect the parent workstreams and plan. A project whose tasks are all terminal may still have missed its outcome.

Update shared context when the work changes how the repository operates. Add a learning note when an observed problem warrants a process change. A useful proposal names the problem, evidence, proposed change, owner, and way to judge whether it helped.

Report the result as `done`, `partial`, or `blocked`. State what passed, what was not checked, and the next concrete pickup. Commit, push, publish, or change a tracker only when the assigned workflow authorizes it.

## File contracts

Use the repository's templates as the canonical file shapes. The portable package includes copies for repositories that lack them. Preserve existing IDs, unknown frontmatter fields, prose, and history when updating a contract.

Use kebab-case project slugs, `WS-A` workstream IDs, and `T-001` task IDs. Workstream and task IDs are local to a project. Keep filenames descriptive and short.

### Spec

[The spec template](.project/templates/spec.md) records the user problem, outcome, acceptance scenarios, scope, requirements, assumptions, dependencies, probe findings, and approval notes.

Its frontmatter contains `name`, `slug`, `owner`, `status`, `created`, `updated`, `outcome`, `uncertainty`, `probe_required`, `probe_status`, and `probe_decision_rationale`. `operating_mode` selects the contract requirements described below. An optional `roadmap_item` links the project to one strategic item.

`[enforced]` `uncertainty` is `low`, `medium`, or `high`; `probe_required` is a boolean; `probe_status` is `pending`, `skipped`, or `completed`. A skipped probe requires a non-empty rationale.

Use `planned` for a spec still being prepared or awaiting activation, `active` for accepted delivery scope, `complete` after outcome review, and `deferred` for deliberately postponed work. "Draft" and "approved" describe review decisions; they are not additional frontmatter states.

### Plan and decisions

[The plan template](.project/templates/plan.md) covers technical context, architecture decisions, contract checks, generated artifacts, workstreams, milestones, testing, rollout, rollback, and remaining risks. Its probe sections record how findings changed the approach.

Plan frontmatter contains `name`, `status`, `lead`, `created`, `updated`, `linear_project_id`, `risk_level`, and `spec_status_at_plan_time`. `operating_mode` is optional on historical artifacts. Leave the tracker value empty when no tracker is connected.

Use the [decisions template](.project/templates/decisions.md) for choices whose rationale would otherwise be lost. Link to the affected spec, plan, task, or research finding.

### Workstream

[The workstream template](.project/templates/workstream.md) has `id`, `name`, `owner`, `status`, `created`, and `updated` frontmatter, with optional `operating_mode`. Its sections are `Objective`, `Owned Files/Areas`, `Dependencies`, `Risks`, and `Handoff Criteria`.

Choose one owner for each shared file or conflict zone. The owner coordinates edits and preserves other operators' changes.

### Task

[The task template](.project/templates/task.md) contains `Description`, `Acceptance Criteria`, `Traceability`, `Technical Notes`, `Definition of Done`, and `Evidence Log` sections.

Core frontmatter contains `id`, `name`, `status`, `workstream`, `created`, `updated`, `linear_issue_id`, `github_issue`, `github_pr`, `depends_on`, `conflicts_with`, `parallel`, `priority`, and `estimate`.

| Field | Meaning |
| --- | --- |
| `depends_on` | Array of prerequisite task IDs in the same project. A prerequisite is satisfied by `done`. |
| `conflicts_with` | Paths or globs describing shared files or conflict zones. Older task-ID entries remain legacy input. |
| `parallel` | Boolean indicating whether the task is suitable for concurrent work, subject to dependency and ownership checks. |
| `priority` | `low`, `medium`, or `high`. |
| `estimate` | `S`, `M`, `L`, or `XL`; used to judge whether a task needs splitting. |
| Tracker fields | Optional references in use; the current template retains their keys with empty values when unused. |
| `story_id`, `acceptance_criteria_ids` | Optional links to the spec's stories and acceptance scenarios. |
| `operating_mode` | Optional mode declaration; otherwise follow the project's mode. |
| `blocked_owner`, `blocked_check_back` | Required by the status validator when a task is blocked. |

### Updates and invariants

Use the [progress update template](.project/templates/progress-update.md) for completed work, work in progress, blockers, and next actions. Include an actual UTC `timestamp`, a supported `status`, and task or stream references where applicable.

The usual path is `updates/<date>-<short-title>.md`. Existing stream-oriented projects may use `updates/<task>/stream-<id>.md`. Keep long messages in the body. The CLI can derive long filenames from update messages, so provide a short title where the installed version supports it.

- `[enforced]` Contract timestamps use ISO 8601 UTC format, such as `2026-09-12T14:30:00Z`.
- `[policy]` Keep `created` unchanged and set `updated` to the actual mutation time.
- `[enforced]` Local task dependencies must exist and form an acyclic graph.
- `[policy]` Use valid YAML scalars, booleans, and arrays. Quote text containing YAML-sensitive characters such as `: ` or `#`.
- `[policy]` Replace placeholders with known facts or explicit unknowns. Support completion claims with observed evidence.

## Operating modes

Modes scale the declared contract requirements. Choose the smallest mode that covers the work's uncertainty and coordination needs.

| Mode | Slug | Declared minimum | Use |
| --- | --- | --- | --- |
| 0 | `patch` | Task | Small, understood correction. |
| 1 | `scoped-change` | Task | Bounded change with a clear approach. |
| 2 | `feature` | Spec, plan, task | Feature with the full spec and plan sections. |
| 3 | `uncertain-feature` | Spec, plan, task | Feature whose uncertainty also calls for a probe. |
| 4 | `multi-stream` | Spec, plan, workstream, task | Coordinated work across independently owned areas. |

`[enforced]` The operating-mode validator rejects unknown modes and checks the required spec and plan sections for modes 2-4. A spec or plan without its own mode inherits the project mode from its sibling. Projects with no declared mode retain legacy validation; do not rewrite closed history merely to add a mode.

`[enforced]` Once a mode-declaring project progresses beyond `planned`, it needs the mode's required artifacts. Every such project needs at least one task; mode 4 also needs at least one workstream. A newly created planned project may be empty.

The current CLI still creates `spec.md`, `plan.md`, and `decisions.md` for patch mode, and `task add` requires a workstream. Modes 0 and 1 therefore reduce content requirements without reducing the scaffold to one task. A task-only record created through the portable skills may fail the current CLI validator's repository requirements.

Acceptance, dependency, evidence, and safety requirements apply in every mode.

## Status and closure

| Artifact | Allowed states |
| --- | --- |
| Spec | `planned`, `active`, `complete`, `deferred` |
| Plan | `planned`, `active`, `done`, `deferred` |
| Workstream | `planned`, `active`, `done`, `deferred` |
| Task | `planned`, `ready`, `in-progress`, `blocked`, `done`, `deferred` |
| Update | `in-progress`, `blocked`, `done`, `deferred` |

For tasks, `planned` means captured work, `ready` means executable scope with clear prerequisites, `in-progress` means work has started, and `blocked` means a stated obstacle prevents progress. `done` requires acceptance and evidence. `deferred` records a deliberate scope or timing decision and does not satisfy a dependency.

Specs, plans, and workstreams do not have a `blocked` state. Record the blocker and next action without inventing a status. The project lifecycle is represented by its spec and plan.

### What the tooling checks

- `[enforced]` Validation rejects unsupported task statuses and blocked tasks without `blocked_owner` and `blocked_check_back`.
- `[enforced]` An `in-progress` or `done` task cannot have unresolved local dependencies. Ready-queue selection skips tasks whose prerequisites are not done; legacy `ready` graphs remain readable for migration.
- `[enforced]` An `in-progress` or `done` task needs an existing parent workstream. Its project must have an active or complete spec and an active or done plan.
- `[enforced]` An `in-progress` task needs an active workstream. A done task needs an active or done workstream.
- `[enforced]` A project or workstream with at least one task and no open tasks must have a closed lifecycle state. This check does not cover empty workstreams.
- `[enforced]` Validation rejects done tasks with unchecked acceptance criteria or missing required evidence content.

The last check validates recorded claims. A reviewer still needs to inspect the underlying work and results. The current `task close` command can mark a task done and roll its parents to completion before a later validation run rejects unchecked acceptance criteria. Check acceptance before closing and inspect the result afterward.

### CLI rollups

Prefer the CLI for lifecycle changes when its runtime is available. It updates related contracts without regenerating their prose.

| Action | Effect |
| --- | --- |
| Add a task | Creates a `planned` task. |
| Open a task | Sets it to `ready` and reopens completed parents as needed. |
| Start a task | Checks dependencies and workstream existence, then activates the affected parents. |
| Close a task | Sets it to `done`, records evidence, and rolls up its workstream and project. |
| Defer a task | Records the deferral and applies scoped rollups. |
| Close a prerequisite | Can release dependent tasks whose only blocker was their dependencies. |

A workstream rolls to done when its non-empty task set is entirely done or deferred. A project can roll to `spec: complete` and `plan: done` when all tasks are terminal. Reconcile deferrals with the agreed scope before treating that result as successful delivery.

`[policy]` Do not close a project with unresolved required work. Inspect every workstream, including empty ones: an active workstream with no tasks can survive project close in the current implementation. Reopening work also requires its parents to represent the resumed work accurately.

## Quality and evidence

Acceptance describes observable behavior. Evidence identifies what was checked, the result, and where a reviewer can inspect it. "Fixed" or "tests pass" alone gives the next operator too little to assess.

Use an entry like this, filled from an actual check:

```text
- <UTC timestamp>: AC-001: <command or inspection> produced <observed result>. Evidence: <test, diff, or repository-relative artifact>. Limits: <anything not covered>.
```

Associate results with the revision or working-tree state actually checked when that information is available. Do not invent commit IDs or claim a run covers later edits. Keep unmet criteria unchecked. Explain why a check is inapplicable instead of marking it as passed.

### Choose checks by risk

| Change or risk | Useful checks |
| --- | --- |
| Prose or configuration with no behavior change | Review the diff and check affected links, syntax, or configuration validity. |
| Isolated behavior | Focused unit or integration checks that exercise the changed behavior. |
| Cross-component behavior | Integration checks across the affected boundary and relevant regression coverage. |
| User interface | Exercise changed flows in the browser; inspect layout, interaction, and relevant console errors. |
| High-risk behavior | Cover failure paths and regressions; verify rollout and rollback where applicable. |

`[policy]` High-risk UI changes require GUI evidence. Use `.project/context/gui-testing.md` to define applicable modes, routes, screenshots, console checks, and design thresholds. Select checks for other work according to the behavior it affects.

Run the repository's relevant lint, type checks, tests, build, and contract validation. Record commands and observed results. If a check cannot run, explain the cause and its effect on confidence. Stop expanding the test run once the required checks pass unless a new failure, change, or unresolved concern warrants more work.

### Review and closure gates

- `[policy]` Tasks that change runtime behavior need a PR or recorded diff review with a named reviewer.
- `[policy]` A solo operator may self-review, but must record what they checked and what they did not. A bare checked box is insufficient.
- `[policy]` A checked "Review complete" item must point to a PR, review note, or explicit self-review entry.
- `[policy]` Close only after implementation, applicable acceptance criteria, required checks, review, and evidence are complete. Reconcile docs and tracker references when the change affects them.

Before a merge or release, resolve required review blockers and preserve the verification evidence. After an authorized merge, update the local lifecycle and any connected tracker references. A release note should identify what shipped and any remaining limits.

## Optional strategy and roadmap

Use vision and mission files for durable direction. Use roadmap items for strategic priorities spanning one or more delivery projects. Project tasks continue to carry execution detail.

`[enforced]` Roadmap validation applies when a repository has `.project/roadmap/` or project `roadmap_item` references. Repositories with neither need no roadmap setup. Optional `vision.md` and `mission.md` join the overview context profile when present; they have no structural or minimum-length validation.

`[enforced]` Each item lives at `.project/roadmap/RM-###-<slug>.md` and follows this contract:

| Contract part | Required shape |
| --- | --- |
| Frontmatter | Exactly `id`, `name`, `status`, `horizon`, `created`, and `updated`. |
| Status | `planned`, `active`, `done`, or `deferred`. |
| Horizon | `now`, `next`, or `later`. |
| Ordered sections | `Strategic intent`, `Outcome signal`, `Boundaries`, `Closure evidence`. |

`[enforced]` A project spec may reference one existing roadmap item with `roadmap_item: RM-###`. That project-to-item reference is authoritative. The viewer derives reverse links, project counts, task totals, source paths, and latest delivery activity.

`[enforced]` Keep project lists, completion percentages, scheduling dates, estimates, assignments, dependencies, velocity, and commit counts out of roadmap contracts. `created` and `updated` remain required metadata. Roadmap horizons express priority.

`[enforced]` An active item must be in `now` and have at least one active linked project. Closing an item requires non-empty closure evidence, at least one complete linked project, and all linked projects terminal: `complete` or `deferred`. Closure is explicit; closing a project does not close its roadmap item.

A non-terminal `now` item receives an advisory staleness reason when it has no active linked project or no recent linked delivery activity for 21 days. This signal does not change status, block work, or fail validation.

`[policy]` Promotion creates a project contract first. Starting an agent from the resulting spec is a separate optional action. Keep that distinction in CLI and viewer flows.

## Parallel work

Use parallel execution when work can be partitioned, shared-file overlap is low, dependencies are known, and the time saved outweighs coordination and integration costs. Get delegation authorization where the user's or repository's instructions require it.

`[policy]` Assign one owner to each shared file or conflict zone. Sequence changes to shared contracts and interfaces before dependent work. Define the handoff between streams and the order in which results will be integrated.

Before editing, check whether another stream owns the affected area. If a conflict appears, record it and agree on ownership or sequence. Do not force an overwrite or merge and leave the next operator to reconstruct the loss.

Where a repository uses leases, acquire and check them before overlapping work, then release or hand them off explicitly. Check file ownership, dependencies, and Git conflicts alongside the lease state.

Progress notes should say what changed, what is blocked, and the next action. A handoff should let the next operator resume without reading the entire transcript.

## Linear and GitHub

Tracker integration is optional. The current repository has no project or task mappings in `.project/registry/linear-map.json`. The Linear mapping below is a proposed design. Existing inspection, drift, and repair tools compare snapshots and produce proposals; a live integration remains to be implemented.

### Reconcile connected state

For an adopted integration:

1. Read local contracts and the mapping registry.
2. Read the accessible remote state or supplied snapshot. State which one was used and when it was captured.
3. Classify differences in mappings, statuses, dependencies, and orphaned records.
4. Prepare a repair with the affected IDs, proposed changes, and risks.
5. Apply authorized changes and verify the result. Update mappings only from observed IDs.

`[policy]` Review a dry run before external writes and check that the user's authorization covers the proposed operation. Preserve mappings and remote history. Record only IDs returned by the tracker.

Low-risk local cleanup can proceed within the assigned task. Semantic conflicts need an explicit resolution. High-risk or destructive repairs need a recorded decision and authorization for the specific action. If tracker access is unavailable, report the comparison as incomplete.

### Proposed Linear mapping

| Delano concept | Proposed Linear representation |
| --- | --- |
| Shared outcome across projects | Optional initiative. |
| Spec | Project document. |
| Delivery project | Project. |
| Workstream | Milestone plus a workstream label. |
| Task | Issue; subissues only where decomposition helps. |

Keep one stable workstream identity across the local contract and its mapped milestone or label. Use initiatives when cross-project direction needs them. A parent-issue model can suit a small change, but should not hide the spec and plan for a larger project.

| Task state | Intended tracker meaning |
| --- | --- |
| `planned` | Backlog or Todo, depending on readiness. |
| `ready` | Todo. |
| `in-progress` | In Progress. |
| `blocked` | Blocked, or Todo with an explicit blocker label. |
| `done` | Done. |
| `deferred` | Canceled, Icebox, or Backlog, according to team policy. |

Verify the target workspace's statuses and API capabilities before implementing an adapter. Preserve semantic meaning when names differ. Map dependencies explicitly, represent conflict zones where the tracker can support them, and reconcile project closure after issue transitions.

### GitHub

GitHub carries implementation collaboration: issues where used, PRs, review, merge, and release records. Keep links in the local tasks so a reviewer can trace a change to its acceptance and evidence.

`[policy]` For actively connected work, reconcile tracker state at least daily and at handoff or closure.

## CLI, validation, and viewer

The CLI and portable plugin are separate packages. The CLI provides executable operations; the plugin provides workflows that can use those operations when available.

### Routine commands

```bash
delano help
delano status --open --brief
delano project show <project-slug> --json
delano next -- --all
delano context --help
```

For lifecycle work:

```bash
delano project create <slug> --name "<name>" --owner <owner> --mode feature
delano workstream add <slug> WS-A --name "<name>" --owner <owner>
delano task add <slug> T-001 --name "<name>" --workstream WS-A --acceptance "<observable result>"
delano task open <slug> T-001
delano task start <slug> T-001
delano task close <slug> T-001 --evidence "<observed result and reference>"
```

Review acceptance and evidence before running the final command. Project, workstream, and task commands also support lifecycle updates; consult the installed help for their flags. `project create` accepts `--probe-rationale`, and project creation and task addition accept a numeric mode or its slug.

Use `delano research` for research intake, `delano import-spec-kit` for supported imports, `delano roadmap` for strategic items, and `delano update add` for progress notes. See the [CLI reference](docs/cli-reference.md) for details and the installed command's help when versions differ.

### Validation and its limits

```bash
delano validate
```

The 0.4.0 validator is a Bash entrypoint with Python and Node checks. Its default run includes project checks and tooling checks for schemas, fixtures, sync, leases, metrics, context, and skills.

Current CLI root discovery requires `.project/` and `.agents/scripts/pm/`. Several wrapped commands also require Bash and Python. When those dependencies are absent, use file-based workflows and label any contract inspection as manual. Treat runtime installation or repair as a separate action within the user's scope.

A fresh consumer install can fail the context audit because the audit requires `AGENTS.md`, while the installer deliberately excludes root agent entrypoints. Report this as an installation or tooling failure and assess the task contracts separately.

For a CLI runtime release from a complete source checkout:

```bash
npm run build:assets
bash .agents/scripts/pm/validate.sh --release
npm test
```

Normal validation warns about dirty `.project` state. Release validation adds package payload drift and requires clean delivery state in both primary and linked worktrees, unless the operator uses the supported `--allow-worktree-state` override. Record the reason when using that override.

For the portable package:

```bash
npm run build:plugin
npm run check:plugin
npm run test:plugin
npm run pack:plugin
```

These commands build and check the package and its resources. They do not install it in a host, evaluate an agent's behavior, or publish it. See the [plugin README](plugins/delano/README.md) for the package layout and installation steps.

### Viewer behavior

`delano viewer` launches the package-owned UI. The selected registered worktree supplies its files and is the target for supported writes and agent launches. The server evaluates context and capabilities for both primary and linked checkouts.

The server exposes `dispatch`, `review`, `publishReview`, and `applyContract`, which currently share the same access check. Relevant operations recheck worktree identity, branch or detached state, context generation, and path containment. Stale or unavailable contexts fail in place.

`[enforced]` Contract apply and roadmap writes require the supported capability, a fresh context, an expected source hash, allowed action fields, and explicit confirmation. The UI presents a preview for review before confirmation. A stale hash returns `409` without applying the change. Handover requests have different hash requirements.

`[enforced]` Unpublished review findings stay local. Explicit publication writes a review under `.project/reviews/`. Review freshness uses normalized source content, `sha256-utf8-lf-v1`, so unrelated HEAD movement does not make a review stale. Published provenance excludes absolute paths, worktree identifiers, and launch receipts.

Legacy `.project/viewer/annotations.json` and generated handovers are migration inputs. Migration is explicit, idempotent, non-destructive, and reports ambiguous evidence. The viewer does not commit, push, open a PR, or post reviews remotely.

The roadmap workspace appears when the index reports roadmap capability. It derives horizon lanes, terminal archives, project and task summaries, source links, and staleness from current contracts. Promotion and agent handover remain separate actions.

The npm package owns the executable viewer server and compiled assets. Its install payload does not copy an executable viewer into the consumer's `.delano/viewer`; older local copies are inert and are not automatically deleted.

The current server lacks Host and Origin checks, so requests from an untrusted web origin can reach endpoints including agent launch. This remains an implementation gap. See the [viewer guide](docs/viewer-guide.md) for the available UI flows.

## Context and responsibilities

Keep facts that apply across projects in `.project/context/`. The standard context files cover project overview and brief, technology, repository structure, system patterns, product context, style, and progress. Add GUI testing guidance when the repository needs it. Vision and mission remain optional.

Refresh context after a milestone, architecture decision, or meaningful session that changed those facts. Record what changed, why it matters to the next operator, and what they should do next. Avoid copying task logs into every context file.

One person can hold all delivery responsibilities:

| Responsibility | Decisions and evidence |
| --- | --- |
| Product owner or PM | Problem, outcome, scope, priorities, and outcome review. |
| Technical lead | Architecture, probe interpretation, work boundaries, risks, and integration readiness. |
| Engineer or agent operator | Implementation, focused checks, current task state, and handoff evidence. |

For solo work, review these responsibilities at stage boundaries. Teams may use daily checks for blockers and connected tracker state, and weekly reviews for outcomes, scope, and recurring risks. Adjust the cadence to the decisions that need attention.

`[policy]` Keep destructive operations, remote writes, and publication within the user's authorization. Do not force a merge, rewrite shared history, suppress a failed check, or overwrite another operator's work to make progress appear complete. Record policy exceptions and their reasons where the next operator can find them.

## Installation, refresh, and migration

### Portable plugin

Use [the portable package](plugins/delano/README.md) to distribute all ten skills with their references and templates. Keep the directory intact. Its root `plugin.json` declares Agent Plugins 1.0.0, and `extensions.com.openai` contains OpenAI presentation metadata. The build generates the Codex compatibility manifest.

The plugin has no runtime dependencies, MCP server, hooks, credentials, or tracker adapters. A host needs skill support and access to the target repository to save changes. Running project checks still requires that project's toolchain. A chat without repository access can draft files but cannot claim to have saved or verified them.

Local marketplace registration, host installation, and public publication are separate steps. Follow the package README for the supported layout and links to current host documentation.

### Existing CLI installations

`delano install` uses an allowlist and checks conflicts. Use `--only`, `--exclude`, `--no-project-context`, or `--no-project-state` to control the payload. Interactive installation is available through `--interactive` or `--tui`. Inspect the proposed scope before using `--force` and `--yes`.

After installation, `.project/context/`, `.project/projects/`, and `.project/registry/` belong to the consumer repository. Refresh them only when replacing that state is intended. Root agent entrypoints such as `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`, and `PI.md` are opt-in and excluded from the base install.

In installations that still use `.agents` and its `.claude` mirror, edit the canonical runtime and regenerate the mirror. The portable package has its own source directory and build; do not maintain another hand-edited copy of its skills in each adapter.

Older runtime hooks can record sessions, tools, and optional prompt logs. The Codex hook installer can merge a valid `.codex/hooks.json` and skips an invalid or non-file configuration without blocking the rest of installation. Hook execution depends on the host's enablement and trust settings. The portable plugin ships no hooks.

### Migrate an older delivery layout

Migrate when old paths prevent useful work. Keep historical files readable until the new contracts and references have been checked.

1. Inventory old PRDs, epics, tasks, statuses, active work, and tracker IDs.
2. Create `.project/projects/<slug>/` for the work being migrated.
3. Map PRDs to specs, epic plans to plans, and task files to tasks. Preserve identity and useful history.
4. Review status meaning. An old `open` task usually becomes `planned`; retain `ready` only when readiness is established. Check evidence before treating an old `closed` item as done.
5. Record old-to-new paths and IDs in `.project/registry/migration-map.json`. Update tracker mappings only for integrations in use.
6. Validate the new contracts, compare active scope and dependencies, and inspect any tracker sync dry run. Apply external repairs only within authorization.

Migration is ready when required fields and states are valid, IDs and history remain traceable, active dependencies are preserved, and the next operator can find the current contract. Archive old folders after a stable operating period, such as two delivery cycles. Delete them only through an explicit retirement decision.

### Adopt additional process when it helps

Start with one project whose contracts are usable and whose acceptance has evidence. Add tracker sync when a connected workflow needs it; demonstrate clean comparisons before relying on writes. Add parallel execution when independent workstreams can integrate without unmanaged conflicts.

Review recurring failures before adding metrics, leases, or more rules. Use observed rework, reopened tasks, sync errors, or handoff failures to judge whether the added process helps. A new script or checklist needs a problem to solve.

## Templates

Edit the canonical templates here. The plugin build copies the delivery templates it bundles; avoid maintaining another inline copy in this handbook. Required contract section names keep their existing capitalization.

| Template | Purpose |
| --- | --- |
| [Spec](.project/templates/spec.md) | Outcome, scope, acceptance, and probe findings. |
| [Plan](.project/templates/plan.md) | Approach, work design, checks, rollout, and rollback. |
| [Decisions](.project/templates/decisions.md) | Decisions, rationale, and superseded choices. |
| [Workstream](.project/templates/workstream.md) | Ownership, dependencies, risks, and handoff. |
| [Task](.project/templates/task.md) | Executable scope, acceptance, and evidence. |
| [Progress update](.project/templates/progress-update.md) | Progress, blockers, and next actions. |
| [Completion summary](.project/templates/completion-summary.md) | Observed results and remaining limits when a separate summary is useful. |
| [Review](.project/templates/review.md) | Published review findings and source provenance. |
| [Roadmap item](.project/templates/roadmap-item.md) | Strategic intent, outcome signal, boundaries, and closure. |
| [Vision](.project/templates/vision.md) and [mission](.project/templates/mission.md) | Optional direction shared across projects. |
