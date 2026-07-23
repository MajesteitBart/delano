---
name: Branch-Local Viewer Reviews and Packaged Runtime
slug: 022-branch-local-viewer-reviews
owner: bart
created: 2026-07-14T16:41:43Z
updated: 2026-07-14T16:47:00Z
---

# Decisions: Branch-Local Viewer Reviews and Packaged Runtime

## Active Decisions
- D-001: Versioned `.project` delivery state belongs to the selected branch/worktree; repository-canonical state results from normal commit and merge, not primary-worktree identity.
- D-002: Viewer authorization uses endpoint-specific server capabilities plus context risk/provenance, not one primary-derived `writable` boolean.
- D-003: Read, agent dispatch/review, review publication, and guarded contract apply are available in every fresh registered worktree under the same containment, confirmation, baseline, and stale-context protections.
- D-004: Durable collaborative feedback is one tracked, human-readable review artifact per session under `.project/reviews/`, governed by a canonical artifact schema and lifecycle.
- D-005: Tracked review provenance contains only repository-relative source path, branch-at-creation, optional source commit/blob metadata, and a defined normalized source content hash; worktree paths and launch receipts remain local.
- D-006: Review staleness follows reviewed content, not HEAD movement. Hash mismatch is visible and may degrade to quote re-anchoring; it never silently preserves exact-anchor status.
- D-007: Draft reviews are local by default. Explicit publication may record uncommitted source with `source_commit: null` and a warning, but Viewer never commits, pushes, or publishes remotely.
- D-008: Agents consume the tracked review path directly. Generated handover Markdown is derivative and becomes ephemeral or a local activity receipt rather than durable review truth.
- D-009: Review archival is status-driven rather than directory movement, and review enums come only from `review.schema.json`.
- D-010: Normal and release validation apply checkout-neutral dirty-state policy; linked worktrees are not inherently less legitimate than the original checkout.
- D-011: The active Delano package owns and executes the Viewer runtime. Consuming-repository installs no longer copy `.delano/viewer`, while Delano's source/package retains the runtime and compiled assets.
- D-012: Legacy annotations, handovers, and apply-audit evidence migrate only through an explicit, idempotent, non-destructive path with privacy and ambiguity reporting.
- D-013: Published review Markdown uses strict JSON frontmatter as canonical machine state plus a deterministic human-readable body projection; review and finding lifecycle enums come only from `review.schema.json`.
- D-014: `sha256-utf8-lf-v1` removes one UTF-8 BOM, normalizes CRLF and CR to LF, preserves all other content including final-newline presence, and makes content equality the sole exact-versus-stale criterion.
- D-015: Legacy apply-audit entries remain intact in the legacy store and are copied to a Git-local migration receipt; only a privacy-safe summary may enter a tracked migration report because apply audit is not collaborative review feedback.

## Superseded Decisions
- `017-home-registry-worktree-discovery` D-004 and its FR-009/AC-005 interpretation that linked worktrees are inspect-only are superseded by D-001 through D-003 and D-010.
- The existing convention that durable annotations and generated handovers live under `.project/viewer/` is superseded by D-004, D-007, D-008, and D-012.
- The install-manifest convention that copies `.delano/viewer` into every target repository is superseded by D-011.

## Open Decision Questions
- None for the WS-A contract. The anchor/thread representation, hash algorithm, projection rules, and apply-audit destination are fixed in `contracts/review-and-context-contract.md`.
