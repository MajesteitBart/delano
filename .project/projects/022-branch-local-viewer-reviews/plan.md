---
name: Branch-Local Viewer Reviews and Packaged Runtime
status: done
lead: bart
created: 2026-07-14T16:41:43Z
updated: 2026-07-17T09:07:29Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: active
operating_mode: feature
---

# Delivery Plan: Branch-Local Viewer Reviews and Packaged Runtime

## What Changed After Probe

No prototype probe was required. Repository inspection and two independent Claude Fable reviews confirmed that the failure is policy rather than missing infrastructure: selected-root launch, registered-worktree resolution, context generation, path containment, baseline hashes, annotation anchors, artifact schemas, packaging, and validation fixtures already provide bounded implementation seams. Planning therefore focuses on contract replacement, migration, and staged enforcement rather than exploratory code.

## Technical Context

The Viewer derives `context.writable` solely from `worktree.primary`, disables client controls with that flag, and calls `ensureWritableContext` before parsing handover intent. Review annotations and generated handovers live under tracked `.project/viewer/`, while validation fails any uncommitted `.project` change only in linked worktrees. Separately, `delano viewer` launches `.delano/viewer/server.js` from `getPackageRoot()`, yet the install manifest also copies that runtime and its public assets into every target repository.

The target architecture keeps versioned delivery and published review state in the selected branch, uses registered worktree context only for safe local execution, and treats commit/merge as the mechanism that establishes repository history. Machine-local drafts, paths, and receipts stay outside tracked artifacts. Package code remains the sole executable Viewer runtime.

## Architecture Decisions

- Use the selected registered worktree as the execution and write root. Primary/linked role is provenance and risk information, not authorization.
- Replace `writable` with explicit server-derived capabilities: `dispatch`, `review`, `publishReview`, and `applyContract`; enforce each capability at its endpoint as well as in the UI.
- Revalidate repository/worktree membership, branch/detached state, HEAD, context generation, contained source path, and relevant content hash immediately before launch or write.
- Introduce one Markdown review artifact per session under `.project/reviews/`, validated by `review.schema.json`, indexed as role `review`, and archived by status.
- Define cross-platform normalized source hashing as the primary staleness key; branch and optional commit/blob values are provenance, and worktree paths never enter tracked files.
- Keep drafts and launch/activity receipts local. Review publication writes only the artifact; Git and remote operations remain outside Viewer authority.
- Make tracked reviews the direct agent handover input. Legacy generated handover Markdown remains readable during migration but is not produced as canonical state afterward.
- Apply normal/release dirty-state policy identically to primary and linked checkouts.
- Continue shipping Viewer source/compiled assets in the npm package, remove them from the consuming-repository install payload, and provide explicit safe cleanup guidance for legacy copies.

## Policy and Contract Checks
- [x] `.project` remains the execution source of truth
- [x] Probe decision is explicit
- [x] Evidence gates are defined before handoff
- [x] External sync writes require dry-run or operator approval

## Generated Artifact Map
- `spec.md`: Operator-approved session decisions, repository evidence, and independent Fable review findings normalized through `discovery-skill`.
- `decisions.md`: Active policy decisions plus explicit supersession of the prior inspect-only and repository-local Viewer conventions.
- `plan.md`: Architecture, sequencing, rollout, verification, and rollback generated through `planning-skill`.
- `workstreams/`: Three ownership boundaries covering contracts, runtime, and package/adoption surfaces.
- `tasks/`: Atomic implementation and quality units generated through `breakdown-skill`; all remain planned until readiness review.

## Complexity Exceptions
- One project intentionally covers Viewer capabilities, review artifacts, validation, packaging, and guidance because they express one authority/storage model. Splitting them into independent projects would permit contradictory releases such as writable linked worktrees without shareable review contracts, or package cleanup before package-root execution is gated.
- The project stays feature mode rather than multi-stream: one owner and a largely sequential dependency graph outweigh possible parallelism, while workstreams still make file ownership and handoffs explicit.

## Probe-Driven Architecture Changes

- None. Probe status is `skipped`; the architecture is evidence-driven from existing implementation and tests.

## Workstream Design

- WS-A — Review and Context Contracts: define capabilities, hash/provenance semantics, review schema/template/lifecycle, legacy mapping, and superseding documentation contracts. It owns the interfaces consumed by runtime implementation.
- WS-B — Viewer and Validation Runtime: implement server/UI capabilities, fresh-context checks, draft/publish/review flows, migration, direct agent handover, guarded apply, and checkout-neutral validation.
- WS-C — Packaged Runtime and Adoption: remove target-repository Viewer payload duplication, preserve package execution, update handbook/skills/rules/docs/mirrors/assets, and run package/release/browser gates.

WS-B depends on WS-A's schema and capability contract. WS-C's destructive manifest cleanup waits for WS-B behavior and migration to pass, though documentation inventory may begin earlier without conflicting edits.

## Milestone Strategy

- M1 Contract-ready: superseding decisions, capability contract, normalized hash definition, review schema/template, migration mapping, and fixture expectations are approved and validate.
- M2 Runtime-ready: selected-worktree dispatch/review/apply, tracked review lifecycle, stale-context behavior, legacy migration, and checkout-neutral validation pass focused server/UI/CLI tests.
- M3 Distribution-ready: consuming installs omit `.delano/viewer`, package-root Viewer launch passes, legacy cleanup is safe, canonical docs/skills/mirrors/assets agree, and release gates pass.

## Rollout Strategy

1. Land the review schema, template, role vocabulary, and capability response shape without removing legacy reads.
2. Unblock `start` and annotation-free `review` handovers in any fresh registered worktree; this delivers immediate value without canonical writes.
3. Add local drafts and explicit tracked review publication, direct review-path handovers, stale-content handling, and idempotent legacy import while dual-reading legacy data.
4. Enable guarded apply in any selected worktree and make validation checkout-neutral after the new provenance and stale-context tests pass.
5. Stop installing repository-local Viewer files only after package-root launch and package contents are verified; retain explicit legacy cleanup guidance and no automatic deletion.
6. Remove deprecated legacy write paths only after migration fixtures demonstrate lossless behavior and documentation identifies the compatibility window.

## Test Strategy

- Artifact checks: review schema, template/frontmatter validity, status enums, role indexing, strict fixtures, no absolute paths, normalized-hash cross-platform fixtures, and migration idempotency.
- Server integration: linked and primary capability parity, selected cwd/deep-link behavior, start/review with and without findings, context switch races, deleted worktree, branch/HEAD/source drift, containment, oversized input, concurrent publications, and guarded apply.
- UI/domain: draft versus publish, privacy warning, stale/re-anchored findings, lifecycle counts, disabled/error explanations, review navigation/filtering, and legacy display.
- CLI/validation: dirty project state parity across checkout roles, normal versus release behavior, help text, migration reporting, and explicit override semantics.
- Package/install: npm pack contains one executable Viewer runtime, install manifest/presets omit target `.delano`, old local copies are not executed, modified legacy copies are never deleted, payload/mirror drift passes.
- End-to-end browser smoke: select a linked worktree, publish and hand over a review, observe agent cwd/context provenance, reload from the branch artifact, and verify stale-content UX.

## Rollback Strategy

- Capability rollout remains endpoint-specific so dispatch can stay enabled if review publication or guarded apply must be disabled independently.
- Legacy annotation and handover stores remain readable throughout migration; migration never deletes source data, so rollback restores the legacy reader without reconstructing lost feedback.
- New review artifacts are additive tracked files and remain human-readable if Viewer support is rolled back.
- Package cleanup can be reverted by restoring manifest entries; the npm package continues to contain the Viewer throughout, so Viewer launch never depends on target cleanup.
- Validation-policy rollback restores the prior linked-state gate without altering repository history, though published review files remain ordinary `.project` changes.

## Remaining Delivery Risks

- A human-readable review format may become difficult to edit safely if anchors/discussion structure is underspecified; schema and round-trip fixtures are a milestone-one gate.
- Cross-platform normalization can create false staleness if it diverges from existing baseline hashing; one algorithm and fixture set must be canonical before migration.
- Legacy apply-audit records may not map cleanly to a review session; ambiguous records require explicit reporting rather than silent loss.
- Deep links differ in how reliably they honor a selected linked-worktree path; terminal and T3 Code launch paths require platform-specific verification.
- Tracked reviews can expose sensitive comments permanently; explicit publication and privacy copy are release-blocking UX requirements.
- Removing installed Viewer payload may surprise repositories that invoked local files directly despite the CLI contract; release notes and non-destructive deprecation guidance must cover that unsupported usage.
