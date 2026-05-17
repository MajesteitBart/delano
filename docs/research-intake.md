# Delano Research Intake Workflow

## Purpose

Delano research intake is a repo-native way to capture discovery before delivery artifacts become executable work.

It borrows the useful pattern from durable file-based planning workflows:

- a short plan for the research task;
- a findings file for evidence and decisions;
- a progress log for actions, validation, blockers, and handoff.

It does not depend on Obsidian, OpenClaw, local skills, or any private runtime. Those tools may integrate later as optional adapters, but public Delano research intake is just files in the repository.

## Location

Research intake artifacts live inside the owning Delano project:

```text
.project/projects/<project-slug>/research/<research-slug>/
  task_plan.md
  findings.md
  progress.md
```

The project folder remains the boundary of truth. Research artifacts are not a second project management system. They are temporary or supporting discovery state that must eventually fold forward into canonical Delano contracts.

## Create research intake

Use:

```bash
delano research <project-slug> <research-slug> --title "Research title" --question "Primary research question" --json
```

The command refuses to overwrite an existing research folder.

Recommended agent form:

```bash
delano research delano-spec-kit-interop spec-kit-import-edge-cases \
  --title "Spec Kit import edge cases" \
  --question "Which unsupported artifact shapes should block import versus become clarification notes?" \
  --json
```

JSON mode returns one parseable object:

```json
{"ok":true,"command":"research","project":".project/projects/delano-spec-kit-interop","research":".project/projects/delano-spec-kit-interop/research/spec-kit-import-edge-cases","files":["task_plan.md","findings.md","progress.md"],"validation":"passed"}
```

## File roles

### `task_plan.md`

Use this for research intent and current state:

- goal;
- primary question;
- scope;
- current phase;
- planned phases;
- decisions made;
- blockers.

### `findings.md`

Use this for durable discoveries:

- source references;
- observations;
- options considered;
- decisions and rationale;
- open questions;
- fold-forward candidates for `spec.md`, `plan.md`, workstreams, or tasks.

### `progress.md`

Use this as a chronological work log:

- actions taken;
- commands or checks run;
- errors and recovery;
- validation evidence;
- handoff summary.

## Lifecycle

Research intake has four lifecycle stages:

1. **Opened**: folder and three files exist.
2. **Investigating**: findings and progress are updated as research proceeds.
3. **Fold-forward ready**: findings are summarized into concrete changes for canonical Delano files.
4. **Folded forward**: changes have been applied or explicitly deferred, with evidence in `progress.md` and, where relevant, `updates/`.

Research is not complete until it is folded forward or explicitly closed as no-action.

## Fold-forward rules

Research findings should move into canonical Delano artifacts like this:

| Research output | Fold into | Rule |
| --- | --- | --- |
| User problem, users, or success criteria | `spec.md` | Update spec sections, not only findings. |
| Architecture or implementation approach | `plan.md` | Record as proposed or accepted architecture decision. |
| Execution work | `tasks/*.md` | Create or update tasks with acceptance criteria and evidence expectations. |
| Parallelizable domains | `workstreams/*.md` | Create or adjust workstreams only when ownership/conflict zones differ. |
| Decision rationale | `decisions.md` | Record durable project decisions. |
| Status, validation, blockers | `updates/*.md` or task evidence | Keep project history auditable. |
| Open questions | `spec.md` Remaining Unknowns or task blockers | Do not hide unresolved ambiguity in research notes. |

## Guardrails

- Do not store secrets, tokens, or credentials.
- Do not use absolute private machine paths in shared output.
- Do not mark delivery tasks done from research alone.
- Do not treat research files as canonical execution status.
- Do not create external Linear/GitHub records from research without the normal sync and approval semantics.
- Prefer `--json` when another agent will parse command output.

## Relationship to Spec Kit interop

Spec Kit-style authoring can produce useful intent artifacts quickly. Delano research intake provides a governed place to investigate unclear parts before those artifacts become executable contracts.

For the Spec Kit interop project, research intake should answer questions like:

- Which artifact shapes should be supported first?
- Which ambiguous generated tasks should become blocked tasks versus clarification notes?
- Which import behaviors need probes before CLI support?
- Which agent adapters need manifest support?

The fold-forward step is what keeps Delano stronger at delivery governance: research only matters when it improves `spec.md`, `plan.md`, workstreams, tasks, validation, or closeout learning.
