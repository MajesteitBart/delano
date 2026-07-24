# Discovery Runbook

1. Confirm project slug, owner, and measurable outcome.
2. If the project spec has `roadmap_item: RM-###`, resolve the unique `.project/roadmap/RM-###-<slug>.md` item and read its strategic intent, outcome signal, and boundaries before finalizing the project's outcome hypothesis. Stop on a missing or ambiguous reference; do not infer or write a reverse project list.
3. If project scaffold is missing, run:
   - `bash .agents/scripts/pm/init.sh <slug> "<Project Name>" <owner> <lead>`
4. Fill `spec.md` using `.project/templates/spec.md`.
5. Ensure non-goals and dependencies are explicit.
6. Validate:
   - `bash .agents/scripts/pm/validate.sh`

Exit gate:
- Spec outcome is measurable
- Non-goals are explicit
- Assumptions are documented
