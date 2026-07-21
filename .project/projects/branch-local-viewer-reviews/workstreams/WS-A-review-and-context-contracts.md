---
id: WS-A
name: WS-A Review and Context Contracts
owner: bart
status: done
created: 2026-07-14T16:45:49Z
updated: 2026-07-16T17:44:00Z
operating_mode: feature
---

# Workstream: WS-A Review and Context Contracts

## Objective

Establish the authoritative selected-context capability model and a versioned, human-readable review contract that runtime, migration, validation, agents, and documentation can implement without checkout-role ambiguity.

## Owned Files/Areas

- `.agents/schemas/artifacts/review.schema.json` and strict review fixtures
- `.project/templates/review.md` and artifact-role/status vocabulary
- Review provenance, normalized hashing, staleness, anchor/thread, privacy, lifecycle, and apply-audit mapping decisions
- Superseding contract text in this project and traceability to prior Viewer/worktree decisions

## Dependencies

- Existing artifact schema conventions and Viewer annotation anchor model
- Git worktree context inventory, generation token, baseline hashing, and path-containment behavior
- Operator-approved tracked-review and branch-local state decisions in `spec.md` and `decisions.md`

## Risks

- Schema becomes machine-friendly but not human-readable, or human-friendly but unsafe for deterministic round trips.
- Hash normalization differs across Viewer, migration, and validation.
- Legacy apply-audit evidence lacks an explicit durable or local destination.

## Handoff Criteria

- Capability fields and endpoint invariants are documented with no primary/linked authorization dependency.
- Review schema/template validate representative committed, uncommitted, stale, resolved, and archived reviews.
- Tracked provenance excludes absolute/worktree-local paths and defines normalized hash/staleness behavior.
- Migration mapping covers annotations, anchors, resolution, handovers, and apply-audit evidence or identifies a visible exception path.

## Updates

- 2026-07-16T17:27:05Z: T-001 readiness review passed: no dependencies or conflicts, bounded contract ownership, and testable acceptance criteria.
