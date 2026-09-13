---
name: execution-skill
description: Implement or resume agreed Delano work, verify the result, and record evidence. Use when the user asks to carry out a task or continue ready work.
---

# Execution

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) for readiness, evidence, and parent state.

Match the user's request to existing work. Inspect the working tree, relevant task and plan, dependencies, and latest evidence. Preserve user edits. When asked for the next task, choose ready work whose dependencies are done and whose files are available. Check readiness before starting a planned task.

Set the task to `in-progress` and keep its parents consistent through the [CLI](../../references/cli.md) or a scoped file edit. Implement the requested change within its work boundary. If current code invalidates a consequential assumption, update the affected plan or decision before building around it.

Continue through implementation and required verification. Use quality and closeout guidance as needed within the same task. A stage label or completed checklist is no reason to hand the work back unfinished. Record progress when a result, blocker, or next action changes enough to help someone resume.

Run focused checks for the changed behavior and required repository gates. Record what ran, what happened, and where the evidence can be inspected. Repeat checks when later edits invalidate their results. For a blocker, state the affected behavior, cause, and next action; record a known owner and check-back time without inventing them. Continue independent authorized work.

Before closure, inspect acceptance criteria, their evidence, applicable Definition of Done items, and dependencies. Mark only verified criteria complete. Check parent workstreams and projects after any rollup, including empty workstreams. Missing optional CLI tools allow a file-based workflow with an explicit validation limit.

## Result

Lead with `done`, `partial`, or `blocked` and what changed for the user. State checks and material limits, then the next pickup if work remains. Keep status updates about results and blockers; omit routine tool narration. Report the working-tree or commit state at handoff. Commits, pushes, publication, and delegation require authorization for those actions.
