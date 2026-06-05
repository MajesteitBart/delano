# Delano in the First 15 Minutes

## What this guide gives you

This guide takes you from a plain idea to a valid Delano project with governed delivery artifacts.

The mental model is simple:

> Spec Kit-style authoring helps generate intent. Delano governs execution and proof.

You can use this guide with a Spec Kit-style markdown file, or with a plain idea that you turn into a Delano project manually.

## Prerequisites

You need:

- `node` 22 or newer;
- `bash`;
- `git`;
- `python3` or compatible Python runtime;
- a repository where you want Delano delivery contracts.

Install Delano into the target repository:

```bash
cd <repo>
npx -y @bvdm/delano@latest --yes
```

Then validate the runtime:

```bash
npx -y @bvdm/delano@latest validate
```

Expected result: validation exits successfully. If validation fails, fix that before creating delivery work.

## Step 1: Start with a plain idea

Example idea:

> Add quiet-hours support to reminder emails so users are not disturbed overnight, while administrators can still audit what happened.

A Delano project should always keep the outcome visible. If you cannot name the outcome, open research intake first instead of creating executable tasks.

## Step 2: Choose your entry path

You have two good paths.

### Path A: Import a Spec Kit-style markdown artifact

Use this when an authoring tool or agent already produced a spec-like markdown file. The current importer supports the first narrow, single-file Spec Kit-style shape. Full `specs/<feature>/` workspace import is intentionally deferred.

Create a local source file:

```bash
cat > reminder-email-preferences.md <<'SPEC'
# Spec: Reminder Email Preferences

## User Stories
- US-001: As a user, I want quiet-hours handling, so that reminders do not disturb me overnight.

## Acceptance Scenarios
- AC-001: Given quiet hours are configured, when a reminder would send overnight, then it is deferred and audit-visible.

## Requirements
- The system must support quiet-hours windows.
- The system must preserve an audit trail for deferred reminders.

## Needs Clarification
- Should urgent reminders bypass quiet hours?

## Tasks
- [ ] [US-001] Clarify urgent reminder bypass policy
SPEC
```

Import it:

```bash
delano import-spec-kit reminder-email-preferences reminder-email-preferences.md \
  --name "Reminder Email Preferences" \
  --owner team \
  --lead team \
  --json
```

Expected JSON shape:

```json
{"ok":true,"command":"import-spec-kit","project":".project/projects/reminder-email-preferences","source":"reminder-email-preferences.md","validation":"passed"}
```

This creates:

```text
.project/projects/reminder-email-preferences/
  spec.md
  plan.md
  decisions.md
  workstreams/
  tasks/
  updates/
```

The imported project is planned. It is not automatically approved, active, synced, or done.

### Path B: Create a Delano project directly

Use this when you only have an idea and want to draft the spec yourself.

```bash
delano init reminder-email-preferences "Reminder Email Preferences" team team
```

This creates the same canonical project shape, but leaves more sections for you or an agent to fill in.

## Step 3: Open research intake when the idea is unclear

Use research intake before changing canonical delivery artifacts when questions are still fuzzy.

```bash
delano research reminder-email-preferences quiet-hours-policy \
  --title "Quiet-hours policy" \
  --question "Should urgent reminders bypass quiet hours, and how should deferred reminders be batched?" \
  --json
```

This creates:

```text
.project/projects/reminder-email-preferences/research/quiet-hours-policy/
  task_plan.md
  findings.md
  progress.md
```

Research is supporting discovery state. It is not the source of execution truth. Fold durable conclusions into:

- `spec.md` for outcomes, users, requirements, unknowns, and approval notes;
- `plan.md` for technical context, architecture, rollout, tests, rollback, and risks;
- `tasks/*.md` for executable work with acceptance criteria;
- `decisions.md` for durable decisions;
- `updates/*.md` for project history and handoff evidence.

## Step 4: Review the generated spec

Open:

```text
.project/projects/reminder-email-preferences/spec.md
```

Check these sections first:

- `Outcome and Success Metrics`
- `User Stories`
- `Acceptance Scenarios`
- `Assumptions`
- `Needs Clarification`
- `Hypotheses and Unknowns`
- `Probe Findings`
- `Remaining Unknowns`

Do not activate the spec while required clarifications are unresolved.

## Step 5: Make the probe decision explicit

Delano expects uncertainty to be handled deliberately.

If the approach is risky or untested, keep:

```yaml
probe_required: true
probe_status: pending
```

Then run a small prototype probe and record findings before activation.

If no probe is needed, record why:

```yaml
probe_required: false
probe_status: skipped
```

Skipping a probe is still a decision. It should be visible in `spec.md`, `plan.md`, `decisions.md`, or an update note.

## Step 6: Review the plan and tasks

Open:

```text
.project/projects/reminder-email-preferences/plan.md
.project/projects/reminder-email-preferences/tasks/
.project/projects/reminder-email-preferences/workstreams/
```

Check that:

- the plan has technical context;
- policy and contract checks are explicit;
- generated artifact sources are recorded;
- tasks have acceptance criteria;
- tasks have evidence expectations;
- parallel tasks still have conflict/dependency review;
- blocked tasks include an owner and check-back time.

Generated tasks are not enough. They become Delano tasks only when they preserve dependencies, acceptance criteria, and evidence gates.

## Step 7: Validate before handoff

Run:

```bash
delano validate
```

For Delano repo development itself, also run:

```bash
npm run check:text-safety
npm test
```

A good handoff says exactly what passed, for example:

```text
Validation passed:
- delano validate
- npm run check:text-safety
- npm test
```

If validation fails, do not hide it. Record the failure in the task evidence or project update, then fix the underlying issue.

## Step 8: Execute with evidence

When implementation starts, work from `delano next` or the project task files.

Before a task is marked done, its evidence log should show:

- implementation completed;
- tests or validation passed;
- review/acceptance happened where required;
- docs were updated when behavior changed;
- external sync state, if any, was inspected or updated through Delano semantics.

## What success looks like after 15 minutes

You should have:

- one `.project/projects/<slug>/` folder;
- a spec with outcome, stories, scenarios, assumptions, and clarifications;
- a plan with technical context and validation gates;
- workstreams and tasks that are not just generated text, but Delano-governed delivery contracts;
- a validation command that passes, or a clear recorded blocker if it does not.

That is the core difference:

- Spec Kit-style tools help you get to structured intent quickly.
- Delano makes sure delivery remains auditable, validated, and evidence-backed.
