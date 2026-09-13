---
name: quality-skill
description: Review Delano acceptance against implementation and observed checks. Use for a requested review, validation, or readiness decision before closing work.
---

# Quality review

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) for acceptance, evidence, and closure rules.

Establish the review scope and current revision or working-tree state. Read the acceptance criteria, changed source, test strategy, and existing results. Determine which earlier checks still cover this state.

For each criterion, identify the behavior or artifact that demonstrates it. Inspect the implementation and run checks appropriate to its risk and the repository's requirements. A source-text assertion, mock, or checked box has limited coverage; explain what it establishes. GUI checks apply when the change affects the UI. Follow the user's delegation rules.

Distinguish observed passes, observed failures, checks not run, and inapplicable checks with a reason. If the environment prevents a check, state which conclusion remains unverified and assess the available evidence. Avoid adding broad test categories or repeating successful runs without a relevant reason.

Run `delano validate` when a working runtime exists; see [CLI limits](../../references/cli.md). When it does not, manually inspect relevant contract fields, references, dependencies, and lifecycle state, and label that coverage. Contract validation checks recorded state; acceptance review still needs the underlying results.

Keep unmet criteria unchecked. Fix and recheck defects when repair is within the assigned task. Keep a review-only request to findings and evidence. Close delivery records only when the assigned workflow includes closure.

## Result

Lead with defects or missing evidence that affect readiness. For each finding, name the affected behavior, consequence, supporting file or observed result, and repair or check needed. Order findings by impact. Summarize successful checks together. If no defects were found, say what was reviewed and its limits. Avoid generic praise, invented severity scores, and a separate report for every passing criterion.
