# Delano operating modes

Use operating modes to choose the lightest safe delivery contract. The mode should reduce ambiguity, not add ceremony.

| Mode | Slug | Name | Best fit | Minimum contract |
| --- | --- | --- | --- | --- |
| 0 | patch | Patch | Tiny, low-risk fix with obvious validation | Focused change plus validation evidence |
| 1 | scoped-change | Scoped change | Bounded task with clear acceptance criteria | Task contract, acceptance criteria, local validation |
| 2 | feature | Feature | Multi-step delivery with clear solution direction | Spec/plan, task sequence or workstream, validation gate |
| 3 | uncertain-feature | Uncertain feature | Feature with meaningful unknowns | Uncertainty statement, probe decision, probe evidence before build commitment |
| 4 | multi-stream | Multi-stream delivery | Concurrent streams or coordination/collision risk | Workstream map, conflict zones or leases, handoff summaries, sync/drift checks when relevant |

## Validation posture

`operating-modes.json` is the canonical machine-readable contract. Each mode declares a `contract_surface`: its required artifacts and required spec/plan sections. `npm run check:operating-modes` verifies that modes 0 through 4 are present, ordered, uniquely named, documented with requirements, and carry a valid contract surface.

Artifacts that declare `operating_mode` are validated against the declared mode: unknown mode values fail, and mode 2-4 specs and plans must contain their required sections. Modes 0 and 1 require no spec/plan sections, which keeps small work genuinely lighter. Once a mode-declaring project progresses past `planned`, the mode's required artifacts must exist as well: an active project needs at least one task, and an active multi-stream project needs at least one workstream.

Artifacts without `operating_mode` keep legacy validation only. New artifacts created by `delano project create`, `delano workstream add`, and `delano task add` carry the field: project creation defaults to `feature`, while workstream and task creation inherit the project mode unless `--mode` is passed. Do not rewrite closed historical projects just to add the field.
