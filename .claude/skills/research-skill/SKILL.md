---
name: research-skill
description: Open and run repo-native research intake before mutating canonical delivery artifacts. Use when a Delano request has unclear intent, unresolved options, external evidence needs, or material uncertainty that should be investigated before changing spec, plan, workstreams, or tasks.
---

# research-skill

## Trigger context
- delivery intent is unclear enough that direct changes to `spec.md`, `plan.md`, workstreams, or tasks would be speculative
- options, constraints, risks, or external evidence need investigation before planning or execution
- imported or user-provided material needs synthesis into Delano's canonical project artifacts
- a previous `planning_with_files` style briefing would have been useful, but the work must stay inside the Delano repo

## Non-triggers
- obvious implementation tasks with accepted scope
- simple bug fixes or one-file edits
- work that already has an approved spec, plan, and executable `ready` tasks
- personal Obsidian briefing or vault-based planning

## Required inputs
- project_slug
- research_slug
- research_title
- primary_question
- owner
- known_constraints

## Output schema
- `.project/projects/<slug>/research/<research-slug>/task_plan.md`
- `.project/projects/<slug>/research/<research-slug>/findings.md`
- `.project/projects/<slug>/research/<research-slug>/progress.md`
- folded-forward updates to `spec.md`, `plan.md`, `decisions.md`, workstreams, tasks, or update notes when conclusions are durable
- explicit no-action closeout when research does not change canonical artifacts

## Quality checks
- research question is specific enough to answer
- findings cite inspected files, commands, sources, or artifacts
- progress log records actions, validation, blockers, and closeout
- durable conclusions are folded into canonical Delano project artifacts
- research files do not contain secrets, credentials, private machine paths, or Obsidian vault paths
- research output is not treated as executable task truth until folded forward

## Failure behavior
- stop if project slug does not exist
- return a narrower research question when the current question is too broad
- document evidence gaps before recommending artifact changes
- leave canonical project files unchanged when findings are weak or unresolved

## Allowed side effects
- create a research intake folder under `.project/projects/<slug>/research/<research-slug>/`
- update `task_plan.md`, `findings.md`, and `progress.md` during investigation
- update canonical Delano artifacts only after evidence supports the change
- run Delano validation after creating or folding forward research

## Script hooks
- `delano research <project-slug> <research-slug> --title "<Research Title>" --question "<Primary Question>" --owner <owner> --json`
- `delano validate`
- `delano status`

Use the Delano CLI instead of invoking bare `bash`. The CLI shares one Bash resolver across research, validation, status, and the other shell-backed commands. It discovers and capability-checks candidates before selecting one, including Git Bash fallbacks on Windows. Set `DELANO_BASH` to a full executable path only when an explicit override is needed.

## Lineage
This skill adapts Bart's `planning_with_files` pattern to Delano. Keep the useful three-file working state and closeout discipline, but do not use Obsidian, `BartsVault`, or external briefing folders. Delano research belongs inside the project repository.

## Execution assets
- `references/runbook.md`
- `templates/research-summary.md`
- `templates/fold-forward-checklist.md`
