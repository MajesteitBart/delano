---
name: sync-skill
description: Compare or reconcile identified Delano contracts with GitHub or Linear records. Use for requested drift inspection or synchronization using existing references and available tracker state.
---

# Tracker synchronization

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) for local identity and lifecycle semantics.

Identify the requested scope, mappings, tracker references, and state source. Read `.project/registry/linear-map.json` when present. An empty mapping means there is no mapped scope to compare. Use a supplied issue or project reference, or ask for a target if needed; do not generate empty registries or drift reports.

Use available tracker tools, a configured CLI, or supplied snapshots. Record retrieval or snapshot time. The plugin provides no connection or credentials. Missing live access limits remote verification; a snapshot comparison can still answer a bounded question.

Compare identities, mapped statuses, owners, dependencies, references, and relevant closure evidence. Apply the repository's field ownership rules. Local contracts govern execution, and a closed remote issue alone does not establish local acceptance. Resolve status meaning from the mapping rather than similar-looking labels.

For each real difference, identify the target ID, current and proposed values, reason, and source. Distinguish a stale mapping from conflicting edits. Expose ambiguous ownership or intent before choosing a value.

Apply changes only within existing authorization. An inspection request authorizes comparison. For an authorized write, refresh the affected records, check for concurrent edits, use known IDs, and read back the result. Stop the affected write on a conflict and report what already changed. Post comments or messages only when explicitly requested.

## Result

Start with what differs or what changed. A table of affected records helps when there are several. Include source freshness and unresolved conflicts. If compared state agrees, one sentence naming the scope and source is enough. Save a report only when needed for a decision or handoff, and describe a snapshot comparison as such.
