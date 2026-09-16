---
name: prototype-skill
description: Test a material technical or product uncertainty with a bounded Delano experiment. Use when a spec calls for a probe or existing evidence cannot establish whether an approach works.
---

# Prototype probe

Use the [writing and scope guidance](../../references/output.md). Read [delivery contracts](../../references/contracts.md) for spec and probe state.

Read the spec, previous findings, and the behavior in doubt. State the hypothesis, the observation that would support or reject it, and a time or effort limit. Reuse limits already agreed. Build the smallest experiment that can produce that observation.

Keep experiments within the user's authorization. Use an isolated fixture when real data could change. Identify necessary inputs, permitted side effects, and temporary resources to clean up. If a missing service prevents the real experiment, test useful components where possible and leave the original question unresolved.

Run the experiment and record the setup, command or method, observed result, and relevant evidence. Distinguish real integrations from mocks. A visual mockup can test a design question; it cannot establish backend behavior. Stop at the agreed limit or once the question is answered. Record an inconclusive result when that is what happened.

Update the findings in the existing spec or bundled [spec template](../../assets/templates/spec.md). State what the result changes about the approach. `probe_status: completed` means the experiment finished, including a failed hypothesis; it does not mean the approach succeeded. Assess production requirements before reusing probe code. Clean up only resources created for this experiment and report anything retained.

## Result

Lead with proceed, revise, or unresolved, and the observation supporting it. Give enough setup detail to understand the result, its limits, and the next implementation decision. Link the evidence. Keep the experiment's chronology in its log if needed.
