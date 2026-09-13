# Delivery contracts

Read the part that applies to the requested work. Existing repository instructions, contracts, and templates take precedence over these defaults. The user's instructions take precedence over skill guidelines. If a skill instruction causes a pause or a departure from the request, identify the exact skill and instruction and explain its effect; do not invent an approval gate.

## Package and repository paths

Links in a skill resolve from that skill's `SKILL.md`. The package's `assets/templates/` holds reusable input; never write delivery state into the installed plugin. Paths beginning with `.project/` refer to the target repository. Establish that repository from the user's context or working directory before writing.

Prefer existing files and `.project/templates/`. When a template is absent, use the bundled equivalent. Preserve unknown frontmatter keys, prose, history, line endings where practical, and current local edits. Replace template placeholders with concrete information; unresolved requirements should be stated as unknowns with their effect on the work.

## Choose a proportionate record

| Work | Useful record |
| --- | --- |
| A small correction in existing work | Update the existing task or evidence note. |
| A bounded new task | Task with acceptance criteria and evidence; add parent artifacts only where repository contracts require them. |
| A feature | Spec, implementation plan, tasks, and a decisions log when there are decisions worth preserving. |
| An uncertain approach | A research or probe record linked to the spec before committing to the uncertain implementation. |
| Multiple independent work areas | Workstreams with clear file ownership and dependencies. |

Common layout:

```text
.project/projects/<project-slug>/
  spec.md
  plan.md
  decisions.md
  workstreams/WS-A-<name>.md
  tasks/T-001-<name>.md
  updates/<date>-<short-title>.md
  research/<research-slug>/
```

This is a path convention, not a command to create every file. The existing Delano CLI currently creates spec, plan, and decisions even for patch mode and requires a workstream before adding tasks. The plugin does not change those constraints. A task-only record in an uninitialized repository is not guaranteed to pass the legacy validator.

## Identity and lifecycle

Use unique kebab-case project slugs, `T-001` style task IDs, and `WS-A` style workstream IDs. IDs are local to the project. Preserve the repository's numbering convention and do not renumber existing work.

| Artifact | States used by the existing Delano contracts |
| --- | --- |
| Spec | `planned`, `active`, `complete`, `deferred` |
| Plan | `planned`, `active`, `done`, `deferred` |
| Workstream | `planned`, `active`, `done`, `deferred` |
| Task | `planned`, `ready`, `in-progress`, `blocked`, `done`, `deferred` |
| Update | `in-progress`, `blocked`, `done`, `deferred` |

Do not assign `blocked` to a spec, plan, or workstream when its schema does not allow that state. Record a blocker note, known owner, and next action instead. A task is ready when its scope, ownership, acceptance criteria, and prerequisites are clear. A dependency is satisfied by `done`; deferral is a separate scope decision, not successful completion.

Keep `created` stable and update `updated` with an actual UTC timestamp in `YYYY-MM-DDTHH:mm:ssZ` format. Updates use `timestamp`. Quote free-text YAML scalars containing characters such as `: ` or `#`; keep booleans and dependency arrays correctly typed. Never use the presence of a date or checkbox as proof that a check ran.

## Scope and evidence

Task acceptance describes observable behavior. "A task file exists" is not acceptance evidence for a product behavior. Keep the implementation approach in technical notes and evidence in `Evidence Log`.

An evidence entry should identify the criterion or behavior, what was checked, the observed result, and a source such as a command, output file, test, diff, or artifact. Associate results with the revision or working-tree state actually checked when available. Do not fabricate commit IDs or claim checks covered later edits.

For example, adapt this structure to an actual run:

```text
- <actual UTC time>: AC-001: <command or inspection> returned <observed result>; evidence: <repo-relative artifact or test reference>. <Any limitation>.
```

Use short descriptive update filenames. Keep detailed messages in the body. Do not put full prompts, credentials, personal data, or local machine paths into committed evidence.

Before marking a task done, inspect each acceptance criterion, the applicable Definition of Done items, and the evidence behind them. Leave unmet items unchecked. Explain genuinely inapplicable checks instead of claiming they passed. Check dependencies and current source changes. If using the existing CLI, inspect these conditions before calling `task close`; the CLI does not currently reject every invalid closure itself.

After closure, reconcile affected parents. Check workstreams as well as tasks, including workstreams without tasks. Reopening work may require reopening its completed parents. A project with deliberately deferred work needs an explicit scope decision before closure; "all tasks terminal" does not imply the original outcome was achieved.

## Templates

- [Spec](../assets/templates/spec.md): discovery and probe findings.
- [Plan](../assets/templates/plan.md): approach, work boundaries, validation, rollout, rollback.
- [Decisions](../assets/templates/decisions.md): chosen tradeoffs and superseded decisions.
- [Workstream](../assets/templates/workstream.md): ownership when coordination is needed.
- [Task](../assets/templates/task.md): acceptance, dependencies, evidence.
- [Progress update](../assets/templates/progress-update.md): durable progress or handoff notes.
- [Completion summary](../assets/templates/completion-summary.md): use when the closure scope benefits from a separate summary.
