# Using Agents With Delano

Delano is designed for multi-agent delivery, but agents need clear instructions. The goal is not to make an agent memorize process. The goal is to keep it anchored to repo files, evidence, and validation.

## Core Rule For Agents

Tell agents:

```text
This repo uses Delano. Read `AGENTS.md`, then the adapter note for your runtime. Treat `.project/` as the delivery source of truth. Before editing, inspect `git status`, the relevant spec, plan, workstream, and task files. Make the smallest task-safe change, record evidence, run the relevant validation, and report what passed, what failed, and what remains blocked.
```

If the repo does not yet have a good `AGENTS.md`, run:

```bash
delano onboarding
```

The onboarding command asks for explicit approval before analysis and does not edit the file on its own.

## What Agents Should Read First

For implementation work, require:

- `AGENTS.md`
- `.agents/adapters/<agent>/README.md`
- `HANDBOOK.md` when the workflow is unclear
- `.project/context/` files relevant to the repo
- `.project/projects/<slug>/spec.md`
- `.project/projects/<slug>/plan.md`
- relevant workstream files
- relevant task files

For a quick status scan:

```bash
delano status --open --brief
delano next -- --all
```

## Do Not Miss

Agents should not:

- mark tasks done without evidence;
- treat research files as executable task truth;
- skip validation before handoff;
- overwrite `.project/context/` or `.project/projects/` during package refresh unless explicitly requested;
- perform remote GitHub or Linear writes unless the workflow explicitly asks for it;
- trust generated Spec Kit-style tasks without reviewing blockers, acceptance criteria, dependencies, and evidence expectations;
- rely only on chat history when the repo files disagree.

## Good Agent Requests

Implementation:

```text
Work on task `T-001` in project `reminder-email-preferences`. Read the project spec, plan, owning workstream, and task file first. Keep the change task-scoped. Update the task evidence with the validation you ran. Do not close the task unless all acceptance criteria are met.
```

Research:

```text
Intent is unclear. Use Delano research intake for project `reminder-email-preferences` with slug `quiet-hours-policy`. Answer whether urgent reminders bypass quiet hours and what audit evidence is needed. Record findings, then fold durable conclusions into the spec, plan, decisions, tasks, or an update note. Validate after folding forward.
```

Spec Kit import:

```text
Import `docs/spec-kit/fixtures/minimal-spec-kit-project.md` as project `reminder-email-preferences` using `delano import-spec-kit --json`. Review the generated spec, plan, workstream, tasks, blockers, and import update. Do not start implementation until validation passes and unresolved clarifications are handled.
```

Review:

```text
Review this Delano task as a code reviewer. Lead with bugs, process risks, missing evidence, invalid status transitions, and validation gaps. Reference files and lines. Do not rewrite unrelated project contracts.
```

## When To Use Research Skill

Use the research skill before mutating canonical delivery artifacts when:

- the outcome is unclear;
- requirements conflict;
- an imported artifact is ambiguous;
- external evidence is needed;
- implementation options need comparison;
- a probe decision depends on facts not yet gathered.

Open intake with:

```bash
delano research <project-slug> <research-slug> \
  --title "<Research title>" \
  --question "<Primary question>" \
  --owner team \
  --json
```

The agent should update `task_plan.md`, `findings.md`, and `progress.md`, then fold durable conclusions into canonical files. If research finds no change is needed, the agent should record a no-action closeout in `progress.md`.

## Multi-Agent Coordination

When multiple agents work at once:

- assign each agent a project, stream, task, and file ownership boundary;
- prefer `--json` command output when an agent will parse results;
- require agents to inspect current status before starting;
- use task dependencies and conflict zones instead of informal chat agreements;
- avoid concurrent edits to the same project contract unless the agents are explicitly coordinating;
- require each agent to report changed files and validation evidence.

## Closing Work

A task is not done until:

- implementation or contract change is present;
- acceptance criteria are satisfied or explicitly adjusted through the right artifact;
- evidence is recorded in the task or update log;
- validation was run or the reason it was not run is recorded;
- the working tree state is understood.

Close with:

```bash
delano task close <project-slug> <task-id> --evidence "<what passed and where proof lives>" --json
```

When a task closure unblocks dependency-only blocked tasks, Delano reports the opened tasks in the `changes` output.

## Manual Approval Points

Keep these human-controlled:

- Codex hook trust and project trust prompts;
- `delano install --force`;
- installing or replacing repo-root agent entry docs;
- activating a spec with unresolved clarifications;
- skipping a probe when uncertainty is material;
- remote sync writes;
- publishing or release actions.
