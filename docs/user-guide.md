# Delano User Guide

Delano is a delivery system for teams that want a clear path from business goals to shipped software. It is designed to work with different coding agents, but it keeps one shared structure for planning, execution, and evidence.

## The Main Flow

Delano follows this flow:

`Outcome -> Draft Spec -> Probe Decision -> Approved Spec -> Delivery Project -> Workstreams -> Tasks -> Linear Issues -> PRs -> Release -> Learnings`

In plain terms:

- Start with a measurable outcome.
- Write a draft spec before implementation.
- Decide whether uncertainty is low enough to continue or whether a short probe is needed.
- Approve the spec only after that decision is clear.
- Break the work into workstreams and small tasks.
- Track delivery through issues, pull requests, validation, and evidence.
- Capture lessons after release.

## What Changed In This Update

- `.project` remains the source of truth for delivery state.
- `.agents` is now the canonical runtime for scripts, rules, hooks, and skills.
- `.claude` is now documented as a compatibility path, not the primary runtime.
- Specs and plans now include explicit fields for uncertainty and probe decisions.
- The workflow now makes the probe decision visible before spec approval.

## Key Paths

- `.project/` contains specs, plans, tasks, updates, and project context.
- `.agents/` contains the shared runtime: scripts, rules, hooks, skills, logs, and adapters.
- `.claude/` may exist as a mirror of `.agents/` for compatibility with Claude-style paths.
- `HANDBOOK.md` is the full operating handbook.

## When To Run A Probe

Run a short probe when the team would otherwise be approving a spec based on guesswork.

Common examples:

- You are not sure whether a technical approach will work.
- A dependency or integration risk is still untested.
- The smallest safe rollout path is unclear.
- A UI or workflow concept needs a fast reality check before planning in detail.

You do not need a probe for every project. If uncertainty is already low and the path is clear, record that and continue.

## How To Start

1. Validate the runtime:

   ```bash
   bash .agents/scripts/pm/validate.sh
   ```

2. Create a new project scaffold:

   ```bash
   bash .agents/scripts/pm/init.sh <slug> "<Project Name>" <owner> <lead>
   ```

3. Fill in the draft spec under `.project/projects/<slug>/spec.md`.
4. Record the uncertainty level and whether a probe is required.
5. Approve the spec only after the probe decision is explicit.
6. Continue with planning, breakdown, execution, quality, and closeout.

## Daily Working Pattern

- Keep the active project files in `.project/projects/<slug>/` up to date.
- Use small, reviewable tasks with clear acceptance criteria.
- Record progress and blockers in `updates/`.
- Re-run validation before handoff or merge.
- Treat evidence as part of completion, not as an afterthought.

## Canonical Commands

Use `.agents/scripts/...` as the default path in documentation and day-to-day work:

```bash
bash .agents/scripts/pm/validate.sh
bash .agents/scripts/pm/status.sh
bash .agents/scripts/pm/next.sh
```

If your environment still uses `.claude/scripts/...`, that path should behave as a compatibility mirror rather than a separate runtime.

## Read Next

- `README.md` for the short repo overview
- `HANDBOOK.md` for the full operating model
- `.agents/scripts/README.md` for script inventory
- `AGENTS.md` for adapter-neutral instructions
