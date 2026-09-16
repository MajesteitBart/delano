---
name: closeout-skill
description: Reconcile a Delano delivery result, acceptance evidence, remaining work, and parent statuses. Use when the user asks to finish work or prepare its final handoff.
---

# Closeout

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) for evidence and lifecycle rollups.

Compare the agreed outcome with the delivered behavior, acceptance evidence, quality findings, and open or deferred work. Record a scope change as a decision. Deferred work needs an agreed disposition; it does not count as implemented behavior.

Check that evidence applies to the current source state. If essential acceptance remains unmet, keep the affected work open and identify the missing implementation or check. Continue an authorized repair when possible. Mark inapplicable or unavailable checks accurately.

For verified work whose closure is in scope, check acceptance items and update status through the [CLI](../../references/cli.md) or scoped edits. A handoff of unfinished work keeps that work open. Inspect affected parents afterward. A project cannot be complete while a workstream remains active, including a workstream with no tasks. A successful close command does not establish that these conditions hold.

Write the closure evidence once in the task or a [progress update](../../assets/templates/progress-update.md). Link existing verification rather than copying logs. Use a separate [completion summary](../../assets/templates/completion-summary.md) only when it adds a useful handoff. Keep filenames short.

Update shared context for facts that changed. Preserve consequential decisions. Propose a process improvement only when an observed problem supports it. Completing a project does not require a retrospective, metrics report, release, or remote status change. Follow the user's scope for those actions.

## Result

Lead with `done`, `partial`, or `blocked` and the delivered outcome. State the evidence that supports closure, material limits, and any remaining work with its next action. Include the working-tree or commit state. Keep the final reply short when the task record already contains the detail. If there is no remaining action, end there.
