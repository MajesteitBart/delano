# Progress

## What Changed
- Completed the 001-handbook-theo-method-upgrade implementation bundle across handbook, templates, runtime scripts, hooks/logging, installer messaging, and skill/runbook references.
- Synced the `.claude` compatibility mirror to the updated `.agents` runtime so canonical and fallback command paths now align.
- Replaced the placeholder `.project/context/` files with repo-specific context for Delano as both product and reference implementation.
- Completed the tracked delivery portfolio through CLI packaging, context reader, contract enforcement, learning loop, multi-agent execution, operational sync, Spec Kit interop, state-command runtime, trust/safety runtime, viewer redesign, viewer annotations and handover, vNext blocker closure, and vNext runtime upgrade.
- Added the working `@bvdm/delano` package: package metadata, `delano` bin entrypoint, command dispatch, lifecycle commands, context commands, viewer command, install manifest, asset build pipeline, and conservative install behavior.
- Replaced the older static viewer source path with a Vite/React/TypeScript viewer app under `.delano/viewer/ui/src`, shipping built assets through `.delano/viewer/public/assets`.
- Completed the viewer annotations and agent handover work: local annotation storage, annotation-aware markdown, drawer/export UX, deterministic handover files, Codex/Claude command generation, and task/workstream `start` and `review` intents.
- Refreshed the context pack on 2026-07-06 in response to viewer handover annotation `70f959d2-8426-4843-96d3-66d411496474`.

## Why It Changed
- The repo had drift between written process, generated scaffolds, and executable runtime behavior around canonical paths and probe-aware delivery.
- Closing that drift restores Delano's contract discipline and makes the documented operating model match the runnable one.
- The repository needed living context that reflects completed packaging, native CLI operation, guarded viewer writes, handover workflows, and Windows validation caveats rather than an older planning baseline.
- The viewer changed from a read-only browser into a guarded local review workspace, so context needed to capture the safety boundary and handover model explicitly.

## What Is Next
- Use `.agents/scripts/pm/*` as the canonical operator path for future work.
- Follow up separately on any external documentation that may still teach legacy `.claude` examples.
- Use native CLI and Node validation in Windows worktrees when Bash is unavailable.
- Keep `.project/context/` current when new projects, viewer behavior, package assets, or validation realities change.
- For future viewer refactors, use `.project/projects/015-delano-viewer-annotations-agent-chat/loopfile.md` as the iteration plan and record evidence in project updates.

## Remaining Risks
- External docs outside this repository may still need canonical-path and viewer-safety updates.
- Full `npm test` can still be blocked in Windows environments that lack `/bin/bash`; prefer targeted Node/native checks and report the Bash dependency clearly.
- Viewer UI lint currently has known React lint findings outside the newest context refresh scope; do not treat lint as clean unless rerun and fixed.
- Annotation and handover files under `.project/viewer/` are review artifacts. They should not be mistaken for canonical task evidence until a Delano update or task evidence log records the outcome.
