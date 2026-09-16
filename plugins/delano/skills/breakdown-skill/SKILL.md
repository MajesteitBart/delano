---
name: breakdown-skill
description: Turn a Delano plan into tasks with observable acceptance, ownership, and valid dependencies. Use when agreed work needs executable task contracts or an existing task needs splitting.
---

# Task breakdown

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) for task IDs, fields, and lifecycle rules.

Read the spec's acceptance scenarios, plan, existing tasks, and workstream boundaries. Reuse work already captured. Split by changes that can be implemented and verified independently. Keep implementation, its tests, and its evidence together when they establish the same result.

Create or update `tasks/T-###-<short-name>.md` using the repository template or bundled [task](../../assets/templates/task.md). Give each task a concrete result, affected area, observable acceptance criteria, and the checks that would establish them. Link existing story or acceptance IDs. Treat estimates as estimates and leave unused tracker references empty.

Avoid separate tasks for announcing a plan, updating status, writing evidence, or checking a box. Those activities normally belong to the work they support. Create documentation or test tasks when they have a useful, independently reviewable outcome.

Add dependencies only for actual prerequisites. Check that IDs exist in the same project and the graph has no cycles. Mark overlapping files or conflict zones even when tasks have no dependency. Use workstreams where the format or coordination requires them. Parallel eligibility does not authorize delegation.

New tasks start `planned`. Move a task to `ready` after checking scope, acceptance, ownership, and prerequisites. Resolve a deferred dependency explicitly; it has not been completed. The [CLI](../../references/cli.md) is optional.

## Result

Show each task's result and dependencies in a compact list or table, linking its file. Identify the first safe pickup and any ambiguity that prevents it. Avoid repeating every acceptance criterion in chat when it is already clear in the linked task. Continue with ready work if execution was requested.
