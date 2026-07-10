---
type: research_findings
project: delano-viewer-work-overview
slug: viewer-work-information-architecture
created: 2026-07-10T07:49:00Z
updated: 2026-07-10T07:53:51Z
---

# Findings: Viewer work information architecture

## Source References

- `.delano/viewer/server.js`: `docMeta()` and `loadIndex()` data semantics; current endpoints and file-scope boundaries.
- `.delano/viewer/ui/src/pages/WorkspacePage.tsx` and `ProjectPages.tsx`: every current table, pagination behavior, and missing query controls.
- `.delano/viewer/ui/src/lib/domain/{navigation,types,workspace-model}.ts`: route taxonomy, index contract, task/project derivations, and current default route.
- `.delano/viewer/ui/src/components/{organisms/Sidebar,molecules/HandoverMenu}.tsx`: current navigation and existing start/review handover actions.
- `.agents/scripts/pm/next.sh` and `HANDBOOK.md` sections 6-7: canonical task lifecycle and dependency-safe ready-queue semantics.
- `git log -n 12 --name-status -- .delano/viewer .project`: recent commits and actual changed-file evidence.
- Live `/api/index` inspection on 2026-07-10: 19 indexed project entries, 359 documents, 120 tasks, all 120 tasks done before this project is decomposed.
- Existing viewer screenshots under `output/playwright/`: current light, warm-neutral viewer visual language and shell proportions.

## Observations

- The viewer indexes only `.project/**/*.md`; it does not expose working-tree changes or committed file history from the rest of the repository.
- `docMeta.updated` prefers canonical frontmatter but otherwise falls back to filesystem mtime. A checkout updates that mtime, so several old files appeared updated at the current checkout time. Filesystem mtime cannot be labeled as historical file activity.
- Current workspace and project tables paginate, but each table implements its own rendering and none expose shared search, per-field filters, or user-controlled sorting.
- The server already emits task `dependsOn` data and preserves all frontmatter. The client type omits `dependsOn`, priority, and estimate, so the look-ahead model can be added without changing canonical task files.
- Delano already defines `ready` plus dependency completion as executable work. `planned` is explicitly not executable. “Should”, “Can”, and “Could” should therefore be derived presentation labels, not new task statuses.
- Existing review handovers already ask an agent to verify acceptance criteria, evidence, and implementation. A Review page can assemble recent done tasks and actual changed files around that action without introducing a second review state machine.
- The existing live watcher covers only `.project`; a Git-backed file-activity endpoint can remain request-driven and read-only in the first delivery, avoiding a new whole-repository watcher.
- Current styling is a quiet premium-neutral light UI with hairline borders, compact Inter typography, JetBrains Mono paths, a 264px contextual sidebar, and shadcn/Radix components. New views should extend this system rather than introduce a second shell.

## Options Considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Reuse `doc.updated` as “updated files” | No server work | Checkout mtimes create false recency; only `.project` files appear | Rejected |
| Read Git history and working-tree state | Actual committed and uncommitted file activity; covers the repository | Requires bounded Git parsing and unavailable-Git handling | Selected |
| Add review/can/should/could lifecycle statuses | Direct labels | Conflicts with canonical Delano lifecycle and validators | Rejected |
| Derive Review and Plan queues from canonical tasks | No contract drift; uses existing dependency and handover semantics | Labels need precise documented rules | Selected |
| Build controls separately per table | Small local diffs | Inconsistent UX and repeated state bugs | Rejected |
| Shared table query state and toolbar primitives | One predictable contract and test surface | Requires an initial extraction | Selected |

## Fold-Forward Candidates

| Finding | Target Artifact | Proposed Change |
| --- | --- | --- |
| Git is the only trustworthy source for actual committed recency | `spec.md`, `plan.md`, `decisions.md` | Add a read-only file-activity endpoint with working-tree and recent-commit records; expose provenance explicitly. |
| Review is a gate, not a task status | `spec.md`, Review workstream/tasks | Show recently done tasks, evidence completeness, and changed files; reuse the existing review handover. |
| Look-ahead labels must be derived | `spec.md`, `plan.md`, Plan workstream/tasks | Define Should/Can/Could as mutually exclusive viewer categories over canonical states and dependencies. |
| Tables need one interaction model | `spec.md`, table workstream/tasks | Add shared search, filters, sortable headers, URL-safe state, result counts, reset, and pagination-after-query behavior. |
| Design approval precedes implementation | `plan.md`, design task | Generate six separate horizontal mockups, loop with Fable until each is at least 9/10, then request user feedback. |

## Open Questions

- Non-blocking for the design gate: whether a later delivery should persist a dedicated human-review attestation. The first delivery intentionally reuses task evidence, checked Definition of Done, annotations, and review handovers rather than adding contract fields.
