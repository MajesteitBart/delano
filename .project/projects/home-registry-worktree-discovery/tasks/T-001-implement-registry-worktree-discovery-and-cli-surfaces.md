---
id: T-001
name: Implement registry, worktree discovery, and CLI surfaces
status: done
workstream: WS-A
created: 2026-07-13T10:57:56Z
updated: 2026-07-13T11:41:50Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: [src/cli/index.js, src/cli/commands/**, src/cli/lib/**, test/cli.test.js, test/fixtures/**]
parallel: false
priority: high
estimate: L
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: [AC-001, AC-002]
---

# Task: Implement registry, worktree discovery, and CLI surfaces

## Description

Implement reusable Node helpers for Git repository identity, canonical primary-worktree resolution, the versioned machine-local registry, and live porcelain worktree parsing, then wire them into CLI dispatch: `delano repos`, `delano repos --forget <path>`, `delano worktrees`, and registration of the resolved repository after successful in-repository commands.

## Acceptance Criteria
- [x] The registry persists only version, derived repository ID, canonical primary path, display name, and last-seen time using atomic temp-write-and-rename; stale paths prune lazily on read and no locking is introduced.
- [x] Registering the primary worktree and any linked worktree produces one repository entry; `--forget` removes exactly the resolved matching entry and reports missing/non-matching input safely.
- [x] Worktree discovery returns path, branch or detached state, HEAD, primary/linked role, prunable/unavailable metadata, and `.project/` availability from Git porcelain output.
- [x] `delano repos` and `delano worktrees` list deterministic output without reading project content; successful commands register quietly, failed commands do not, and CLI help is updated.
- [x] Fixtures and CLI tests cover Windows/POSIX paths, spaces, detached HEAD, stale registry paths, malformed/unsupported registry versions, and success/failure command paths.

## Traceability
- Story: US-001
- Acceptance criteria: AC-001 AC-002

## Technical Notes

- Prefer focused modules under `src/cli/lib/` that both CLI commands and the packaged viewer server can consume.
- Derive identity from the resolved Git common directory; normalize for comparison without leaking machine paths into repository logs/contracts.
- Do not scan the filesystem for repositories or copy `.project/` content into the registry.
- Preserve existing `delano viewer --target` launch semantics as the initial-context input.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-13T11:41:50Z: Implemented registry, worktree discovery, CLI surfaces, help, and success-only registration. node --test test/cli.test.js: 45 passed, 0 failed. git diff --check passed. Live repos/worktrees JSON smoke passed.

- 2026-07-13T11:37:49Z: Implementing registry, Git worktree discovery, and CLI surfaces.

- 2026-07-13T11:37:49Z: Dependency-free task readiness-reviewed against active spec and planned delivery contract.
- 2026-07-13T10:57:56Z: Created during plan condensation; merges the prior T-001 (domain) and T-002 (CLI surfaces).
