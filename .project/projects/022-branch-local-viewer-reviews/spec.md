---
name: Branch-Local Viewer Reviews and Packaged Runtime
slug: 022-branch-local-viewer-reviews
owner: bart
status: complete
created: 2026-07-14T16:41:43Z
updated: 2026-07-17T09:07:29Z
outcome: Any registered worktree can safely dispatch, review, and maintain its branch-local Delano contracts; published reviews are shareable Git artifacts; consuming repositories no longer receive duplicate Viewer runtime files.
uncertainty: medium
probe_required: false
probe_status: skipped
probe_decision_rationale: Repository inspection and the existing worktree, handover, annotation, hashing, packaging, and validation tests provide bounded implementation paths without a separate prototype.
operating_mode: feature
---

# Spec: Branch-Local Viewer Reviews and Packaged Runtime

## Executive Summary

Delano currently treats the original Git worktree as the only writable Viewer context. That rule blocks legitimate projects that exist only on feature branches in linked worktrees, while granting full access to any branch that happens to occupy the original checkout. Replace the checkout-role rule with selected-context capabilities, make reviews durable branch-local Git artifacts, keep drafts and machine-specific launch data local, and stop copying the package-owned Viewer runtime into consuming repositories.

## Problem and Users

Projects, tasks, evidence, and review feedback can originate on any branch. Git primary-worktree identity does not establish branch canonicality, yet the Viewer derives one `writable` boolean from that identity and uses it to disable handover, annotations, and guarded apply. The same feature branch therefore receives different behavior depending on which checkout contains it. Review data is also concentrated in a monolithic `.project/viewer/annotations.json`, generated handover files are tracked as duplicate derivatives, linked-only dirty-state validation conflicts with normal branch-local contract work, and `delano install` copies a Viewer runtime that `delano viewer` does not execute.

Primary users are project authors working in feature worktrees, reviewers who need to publish feedback for colleagues, agents receiving task or review handovers, and repository maintainers responsible for clean package/runtime boundaries and safe migrations.

## Outcome and Success Metrics

- Every fresh registered worktree exposes the same safe Viewer capabilities regardless of primary/linked role; context risk is reported separately from permission.
- Task/workstream start and review handovers launch in the selected worktree and reject stale or unavailable context without falling back to another checkout.
- Published reviews are schema-valid, human-readable, per-session artifacts under `.project/reviews/` that can be committed, pushed, rendered, filtered, and consumed directly by agents.
- Review staleness follows the reviewed source content hash rather than unrelated HEAD movement; tracked reviews contain no absolute or worktree-local paths.
- Local drafts remain private until explicit publication, and Viewer never commits, pushes, comments remotely, or publishes automatically.
- Legacy annotations and handovers migrate without losing open feedback or apply-audit evidence; generated handover documents cease to be canonical review state.
- Normal validation treats dirty project state consistently across primary and linked checkouts, while release validation enforces the same cleanliness rule for both.
- The npm package continues to ship and execute the Viewer, while a consuming repository installation contains no duplicate `.delano/viewer` payload.
- Focused CLI, Viewer server/UI, migration, schema, package, and release checks pass with documentation, skills, templates, mirrors, and generated assets aligned.

## User Stories
- US-001: As a project author, I want Viewer actions to target the branch and worktree I selected, so that branch-local projects can be executed without moving them to the original checkout.
- US-002: As a reviewer, I want to draft feedback privately and publish a review as a repository artifact, so that colleagues and agents can receive the same durable review through Git.
- US-003: As an agent, I want a handover bound to a fresh repository, worktree, branch, revision, and contract fingerprint, so that I never act on silently changed or wrong-checkout context.
- US-004: As a repository maintainer, I want one packaged Viewer runtime and checkout-neutral validation rules, so that repositories avoid generated payload noise and worktree role does not create inconsistent policy.
- US-005: As an existing Delano user, I want legacy annotations and review evidence preserved during migration, so that adopting the new model does not discard feedback or audit history.

## Acceptance Scenarios
- AC-001: Given equivalent branch-local project state in a primary checkout and a linked worktree, when the Viewer loads either context, then read, dispatch, review, annotation-publication, and guarded contract-apply capabilities are equivalent while risk/provenance indicators may differ.
- AC-002: Given a task exists only in a selected linked worktree, when a user hands it over for start or review, then the request succeeds, the receiving agent starts in that worktree, and no primary-checkout fallback occurs.
- AC-003: Given the selected worktree was deleted, switched branch, changed relevant source content, or superseded by a Viewer context switch, when handover or write is requested, then the server rejects it with an actionable stale-context response before launching or writing.
- AC-004: Given a reviewer creates comments, when the review remains a draft, then no tracked review file or outbound action is produced; when the reviewer explicitly publishes, then one schema-valid Markdown review is written under `.project/reviews/` without committing or pushing it.
- AC-005: Given a published review, when a colleague checks out the branch or an agent receives a handover, then the human-readable review path contains every open finding and sufficient repository-relative provenance to verify the reviewed content.
- AC-006: Given HEAD advances only because the review artifact or an unrelated file was committed, when the reviewed source content hash is unchanged, then the review remains current; when that content hash changes, then Viewer marks the review stale and attempts deterministic quote re-anchoring without silently treating anchors as exact.
- AC-007: Given a review is published from uncommitted source content, when the reviewer explicitly confirms publication, then the artifact records a null source commit and a visible warning while still binding to the normalized content hash.
- AC-008: Given tracked review output, when validation and privacy checks run, then no absolute path, worktree-local path, launch receipt, or unsupported author data is present.
- AC-009: Given legacy `.project/viewer/annotations.json`, apply-audit entries, or generated handover files, when migration runs, then it is idempotent, preserves reviewable evidence, reports ambiguous records, and never deletes or rewrites legacy data without an explicit migration action.
- AC-010: Given any valid selected worktree, when guarded canonical Markdown apply runs, then explicit confirmation, current baseline hash, fresh context identity, and containment checks are required independently of primary/linked role.
- AC-011: Given dirty `.project` state in either primary or linked checkout, when normal validation runs, then contract validity is checked and dirty provenance is reported consistently; when release validation runs, then cleanliness is enforced consistently unless an explicit supported override is used.
- AC-012: Given Delano is installed into a consuming repository, when the install plan and result are inspected, then no `.delano/viewer` files are copied; when `delano viewer` launches, then the active package-owned server and public assets are used successfully.
- AC-013: Given the feature is release-ready, when package, mirror, schema, runtime, Viewer, documentation, and skill checks run, then all generated payloads and canonical sources agree on the branch-local review and package-owned Viewer model.

## Scope
### In Scope

- Replace the single primary-derived Viewer `writable` flag with endpoint-specific selected-context capabilities and risk/provenance metadata.
- Fresh-context validation for dispatch, review, annotations, apply, branch/HEAD changes, deleted worktrees, request races, and content hashes.
- A tracked review artifact, schema, lifecycle, Viewer role/index/navigation, draft/publish UX, annotation resolution, archival status, and agent handover integration.
- An explicit normalized content-hash contract, optional source commit/blob provenance, stale-review display, and quote re-anchoring behavior.
- Idempotent migration from legacy annotation/handover storage, including an explicit disposition for apply-audit evidence.
- Checkout-neutral normal/release validation semantics and corresponding CLI help/tests.
- Removal of consuming-repository `.delano/viewer` installation while retaining Viewer source and compiled assets in the npm package used by the active `delano` executable.
- Updates to `HANDBOOK.md`, README files, AGENTS-referenced runtime guidance, relevant skills/rules/templates/schemas, `.claude` mirror, install manifest, generated payload, and package/release tests.

### Out of Scope

- Automatically committing, pushing, opening pull requests, or posting reviews to remote trackers or hosting providers.
- Inferring or configuring a globally canonical branch such as `main` or `master`.
- Cloud synchronization of unpublished drafts or machine-local Viewer state.
- Replacing Git as the transport and merge mechanism for published reviews.
- Redesigning unrelated Viewer navigation, visual language, or project lifecycle semantics.
- Deleting user-modified legacy `.delano` or `.project/viewer` data automatically.

## Functional Requirements

- FR-001: Server context exposes explicit capabilities for dispatch, agent review, annotation draft/publication, and canonical apply; primary/linked role remains provenance only.
- FR-002: Every mutating or launching endpoint revalidates the registered repository/worktree selection and Viewer context generation before acting.
- FR-003: Handover context includes repository identity, worktree identity for local launch, branch/detached state, HEAD, repository-relative contract path, and normalized source hash; tracked artifacts exclude machine-local identity.
- FR-004: The agent is launched with the selected worktree as cwd, and stale/unavailable contexts fail visibly without fallback.
- FR-005: Review drafts remain local; explicit publish writes one per-session Markdown artifact under `.project/reviews/` and performs no Git or remote operation.
- FR-006: A canonical `review.schema.json` defines review status, required provenance, lifecycle values, and validation; Viewer derives review enums from the schema.
- FR-007: Review identity uses repository-relative source path and normalized source content hash, plus branch-at-creation and optional source commit/Git blob metadata; HEAD movement alone never establishes staleness.
- FR-008: Reviews of uncommitted source default to local draft but may be published after explicit warning with `source_commit: null`.
- FR-009: Review archival changes status rather than moving the artifact; open-review counts exclude resolved or archived findings as defined by the schema.
- FR-010: Review handover prompts reference the tracked review artifact directly; generated handover Markdown is noncanonical and may be replaced by an ephemeral activity receipt.
- FR-011: Legacy review migration is explicit, idempotent, privacy-safe, and preserves comments, resolution state, anchors, and apply-audit evidence or reports why a record cannot be mapped.
- FR-012: Guarded apply is selected-worktree capable and retains containment, explicit confirmation, expected-hash, and audit protections.
- FR-013: Normal validation does not fail solely because a linked worktree has uncommitted `.project` state; release cleanliness policy is checkout-role neutral.
- FR-014: `delano viewer` resolves its server and public assets from the active package root, while install manifests and presets do not copy `.delano/viewer` into target repositories.
- FR-015: Existing repository-local Viewer copies are treated as inert legacy runtime; cleanup is explicit and refuses to remove modified or unrecognized files.
- FR-016: Handbook, Viewer/CLI help, skills, rules, templates, schemas, package documentation, compatibility mirrors, and generated assets describe and enforce one consistent model.

## Non-Functional Requirements

- All filesystem roots remain server-authoritative and restricted to registered repositories and fresh Git-reported worktrees.
- Tracked review artifacts are deterministic, diff-friendly, human-readable, free of local absolute paths, and bounded against oversized input.
- Concurrent review publication avoids a monolithic shared file and never silently overwrites another review session.
- Context switches invalidate late requests; branch changes, deleted worktrees, and content drift produce actionable errors.
- Package installation remains recoverable and never deletes repository-local files without explicit user action and modification checks.
- The feature works on Windows, macOS, and Linux path and line-ending conventions.
- No raw prompts, secrets, or machine-local identifiers enter committed review artifacts or logs.

## Assumptions
- Git commits and branches are the collaboration transport for published review artifacts.
- The active `delano` executable can always locate its own packaged Viewer runtime through `getPackageRoot()` whether installed globally, locally, or invoked through an equivalent package mechanism.
- Existing annotation anchors and apply-audit records can be mapped to a per-session review artifact or surfaced as an explicit migration exception.
- A normalized content-hash algorithm can be specified compatibly across platforms without relying solely on Git object IDs.
- Repository maintainers accept tracked reviews by default; repositories that require different retention may use lifecycle/archive policy rather than a different storage root.

## Needs Clarification
- None. The operator approved branch-local delivery state, tracked collaborative reviews, local-only drafts/receipts, and package-owned Viewer runtime during discovery.

## Hypotheses and Unknowns

- A capability split can reuse current context inventory, generation token, path containment, and baseline-hash infrastructure without a new authorization subsystem.
- Per-session review files materially reduce conflicts compared with the current monolithic annotation store.
- Existing package-root launch behavior makes removing installed repository-local Viewer payload a manifest/docs/test change rather than a runtime relocation.

## Touchpoints to Exercise

- `.delano/viewer/server.js` and `.delano/viewer/ui/`
- `src/cli/lib/git-repository.js`, `worktree-state.js`, runtime/validation wrappers, and Viewer command/help
- `.agents/schemas/artifacts/`, `.agents/scripts/pm/validate.sh`, skills, rules, templates, and generated `.claude` mirror
- `.project/viewer/` legacy data and new `.project/reviews/` artifacts
- `assets/install-manifest.json`, `assets/payload/`, package contents, install presets, and package drift checks
- Viewer server/UI/domain tests, CLI tests, schema/strict fixtures, package tests, and release validation
- `AGENTS.md` source-of-truth links, `HANDBOOK.md`, root README, and Viewer README

## Probe Findings

- No separate prototype is required. `delano viewer` already resolves `.delano/viewer/server.js` from the active package root and sets the selected repository only as runtime cwd/root.
- Repository detection requires `.agents/scripts/pm` and `.project`, not a repository-local `.delano` directory.
- Start and annotation-free review handovers currently write no handover file but are rejected before intent parsing in linked worktrees.
- The current `.project/viewer/annotations.json` and generated handover files are tracked in this repository, so migration and package cleanup must be explicit.
- Existing context generation, registered-worktree resolution, containment guards, expected file hashes, and selected-root agent launch provide reusable safety primitives.

## Footguns Discovered

- Primary worktree and integration branch are independent; a feature branch in the original checkout currently receives broader permission than the same branch in a linked checkout.
- Binding review staleness to HEAD would make publishing the review invalidate itself; staleness must follow reviewed content.
- Persisting absolute/worktree paths would leak machine layout and make reviews nonportable.
- Raw Git blob IDs alone may differ across checkout filters/line-ending behavior; the review hash contract must define normalization.
- Moving archived review files creates avoidable rename conflicts; lifecycle should be status-driven.
- Removing `.delano/viewer` from the npm package would break the active Viewer; only the consuming-repository install copy is redundant.
- Normal validation currently treats linked dirty project state as an error but ignores equivalent primary-checkout state.

## Remaining Unknowns

- The exact backward-compatible Markdown/frontmatter representation for annotation anchors and discussion threads will be fixed in the schema-design task.
- The apply-audit migration target must be selected before legacy migration implementation: tracked review evidence or a separate local audit receipt.
- Existing consumers of generated handover Markdown must be inventoried before those files become ephemeral.

## Dependencies

- Git repository/worktree registry and divergence classification from `017-home-registry-worktree-discovery`.
- Existing Viewer annotation, handover, guarded apply, activity, and context-switch behavior from `015-delano-viewer-annotations-agent-chat`.
- Artifact schema validation, package asset generation, compatibility mirror generation, and release checks.
- Normal commit/push workflows remain user- or agent-controlled and outside Viewer authority.

## Approval Notes

- 2026-07-14T16:45:43Z: Operator approved the complete session decision record for planning and task breakdown.

- The operator approved creating this project from the complete session decision record on 2026-07-14.
- Discovery incorporated an independent Claude Fable architecture review. Fable withdrew its earlier worktree-local review-storage recommendation after the colleague-sharing requirement was clarified and supported tracked per-session reviews with the provenance and schema corrections recorded above.
