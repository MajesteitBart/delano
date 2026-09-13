---
name: planning-skill
description: Choose a Delano implementation approach, work order, verification, and rollout. Use when the outcome is settled or an existing plan needs a material change.
---

# Planning

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) when editing the plan or workstreams.

Read the spec, accepted decisions, probe findings, existing plan, and affected source. Reuse settled choices. Raise an unresolved conflict only when it changes the design or delivery sequence.

Choose the smallest approach that meets the outcome and constraints. Explain consequential tradeoffs and alternatives actually considered. Name the affected files, interfaces, generated outputs, and external changes where they matter to implementation. Avoid adding abstractions, services, or parallel coordination to fill a template.

Update `plan.md` using the repository template or bundled [plan](../../assets/templates/plan.md). Describe the change order and how acceptance will be checked. Include rollout and rollback where deployment or data changes require them. Keep decisions worth preserving in the [decisions log](../../assets/templates/decisions.md), with links from the plan.

Define [workstreams](../../assets/templates/workstream.md) when file ownership or dependencies need separate boundaries, or the repository format requires them. Name owned areas and handoff conditions. Respect the user's delegation rules. Use [CLI commands](../../references/cli.md) when available.

Check that the first implementation step is executable and that later steps have real prerequisites. Continue planning independent areas while a material decision is pending.

## Result

Lead with the chosen approach and its main tradeoff. Give the implementation order, how it will be checked, and any decision still needed. Link the plan. A small change can take a paragraph; use a longer plan only where the work needs explanation. Continue into execution when the user's request includes it.
