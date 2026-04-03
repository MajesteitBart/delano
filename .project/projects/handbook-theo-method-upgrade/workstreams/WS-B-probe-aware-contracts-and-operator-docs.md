---
name: WS-B Probe-Aware Contracts and Operator Docs
owner: team
status: done
created: 2026-04-02T18:03:17Z
updated: 2026-04-03T06:43:27Z
---

# Workstream: WS-B Probe-Aware Contracts and Operator Docs

## Objective

Align templates and user-facing docs with the probe-aware planning model and the `.agents`-first runtime framing so scaffolds, quick-start guidance, and shared runtime docs reinforce the same operating contract.

## Owned Files/Areas

- `.project/templates/spec.md`
- `.project/templates/plan.md`
- `README.md`
- `.agents/README.md`
- `.agents/scripts/README.md`
- adapter and runtime docs that present canonical paths to operators

## Dependencies

- WS-A terminology and stage-model decisions
- confirmation that templates should adopt the new probe fields and sections
- compatibility wording for `.claude` finalized before doc sweep

## Risks

- templates changing without matching init-script output
- README and runtime docs teaching different canonical paths
- probe-aware fields being added inconsistently across spec and plan scaffolds

## Handoff Criteria

- spec and plan templates include the agreed probe-aware contract changes
- operator-facing docs point to `.agents` as canonical and describe `.claude` only as compatibility
- quick-start examples, runtime docs, and handbook language are mutually consistent
- no user-facing doc points to nonexistent runtime directories
