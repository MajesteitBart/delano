# Spec Kit And Research In Delano

This guide explains Delano's Spec Kit-style import path and the research intake workflow. The short version:

> Spec Kit-style authoring helps produce structured intent. Delano governs delivery, evidence, status, validation, and closeout.

## What Spec Kit Means Here

Spec Kit is a spec-driven development style and tool ecosystem that helps teams turn ideas into structured specs, plans, and tasks before implementation.

Delano does not replace Spec Kit. Delano accepts a narrow Spec Kit-style markdown shape as upstream input, then normalizes it into Delano `.project` contracts. After import, Delano rules apply:

- `.project/` is the source of truth;
- generated tasks require review;
- unresolved clarifications remain visible;
- probe decisions must be explicit;
- validation and evidence gates still control delivery;
- imported artifacts are not automatically implemented or synced externally.

## Supported Import Shape

The current importer supports the first narrow single-file markdown shape. It recognizes sections such as:

- `# Specification: <name>` or `# Spec: <name>`
- `## User Stories`
- `## Acceptance Scenarios`
- `## Requirements`
- `## Non-Functional Requirements`
- `## Assumptions`
- `## Clarifications` or `## Needs Clarification`
- `## Implementation Plan`
- `## Tasks`

The detailed contract is in [`spec-kit/import-contract.md`](spec-kit/import-contract.md).

The importer does not yet claim full multi-file Spec Kit workspace support.

## Import Command

Run:

```bash
delano import-spec-kit <slug> <source-md> \
  --name "<Project name>" \
  --owner team \
  --lead team \
  --json
```

Example:

```bash
delano import-spec-kit reminder-email-preferences docs/spec-kit/fixtures/minimal-spec-kit-project.md \
  --name "Reminder Email Preferences" \
  --owner team \
  --lead team \
  --json
```

JSON mode returns:

```json
{"ok":true,"command":"import-spec-kit","project":".project/projects/reminder-email-preferences","source":"docs/spec-kit/fixtures/minimal-spec-kit-project.md","validation":"passed"}
```

The command refuses to overwrite an existing `.project/projects/<slug>/` folder.

## What Import Creates

Import creates:

```text
.project/projects/<slug>/
  spec.md
  plan.md
  decisions.md
  workstreams/
  tasks/
  updates/
```

The generated project starts in non-terminal states:

- `spec.md`: `planned`
- `plan.md`: `planned`
- workstreams: `planned`
- independent tasks: usually `ready`
- ambiguous or clarification-dependent tasks: `blocked`

The importer writes an update note recording source classification, imported counts, unresolved clarifications, and next steps.

## What Import Does Not Do

It does not:

- mark tasks done;
- mark the spec complete;
- mark the plan done;
- approve the project for execution;
- resolve clarifications;
- prove the implementation approach;
- create GitHub or Linear records;
- support every Spec Kit output shape;
- preserve private machine paths or secrets.

## After Import: Required Review

Do not start implementation just because import succeeded. Review:

- `spec.md` outcome, users, stories, acceptance scenarios, assumptions, and unknowns;
- `plan.md` architecture, rollout, test, rollback, and risks;
- workstreams for ownership and conflict boundaries;
- tasks for acceptance criteria, blockers, dependencies, and evidence expectations;
- the import update for unresolved clarifications.

Then run:

```bash
delano validate
```

If `probe_required: true`, run or explicitly defer the probe before treating the plan as executable.

## Research Intake

Use research when imported or user-provided intent is too unclear to safely edit canonical artifacts.

Open intake:

```bash
delano research <project-slug> <research-slug> \
  --title "<Research title>" \
  --question "<Primary question>" \
  --owner team \
  --json
```

It creates:

```text
.project/projects/<project-slug>/research/<research-slug>/
  task_plan.md
  findings.md
  progress.md
```

Use the files like this:

- `task_plan.md`: scope, phase state, decisions, blockers;
- `findings.md`: evidence, observations, options, recommendations, fold-forward candidates;
- `progress.md`: chronological actions, commands, validation, blockers, handoff.

## What The Research Skill Can Do

The research skill is useful for:

- comparing implementation options before planning;
- investigating unclear imported requirements;
- gathering external evidence before changing a spec;
- turning vague user intent into concrete fold-forward recommendations;
- identifying whether a probe is required;
- separating evidence gathering from executable task changes;
- recording no-action closeout when investigation shows no change is needed.

It should not:

- become a separate project management system;
- mark delivery tasks done;
- store secrets or private machine paths;
- replace `spec.md`, `plan.md`, tasks, decisions, or updates;
- hide unresolved questions in research notes only.

## Fold Forward

Research is only useful when durable conclusions move into canonical Delano artifacts or are explicitly closed as no-action.

Fold findings into:

| Finding Type | Target |
| --- | --- |
| User problem, users, outcomes, acceptance | `spec.md` |
| Architecture, rollout, tests, rollback, risks | `plan.md` |
| Durable decision rationale | `decisions.md` |
| Executable work | `tasks/*.md` |
| Ownership or conflict boundaries | `workstreams/*.md` |
| Timeline, validation, blockers, handoff | `updates/*.md` or task evidence |

After folding forward, run:

```bash
delano validate
```

## Typical Combined Flow

```bash
delano import-spec-kit reminder-email-preferences input.md --name "Reminder Email Preferences" --json
delano validate
delano research reminder-email-preferences quiet-hours-policy \
  --title "Quiet-hours policy" \
  --question "Should urgent reminders bypass quiet hours?" \
  --json
delano validate
delano viewer
```

Then review the generated and researched artifacts. Start implementation only after clarifications, probe decisions, task dependencies, and evidence expectations are fit for execution.

## Agent Instruction

Use this prompt shape for imported work:

```text
Review the imported Delano project before implementation. Inspect `spec.md`, `plan.md`, workstreams, tasks, updates, and any research intake. Identify unresolved clarifications, missing acceptance criteria, risky assumptions, dependency problems, and missing validation. Use research intake before changing canonical files if the answer requires investigation. Do not close tasks without evidence.
```
