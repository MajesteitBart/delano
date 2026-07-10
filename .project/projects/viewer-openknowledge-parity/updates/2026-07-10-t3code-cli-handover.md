# T3 Code CLI handover

## Completed

- Built the sibling `t3code-cli` repository as a standalone Node/TypeScript CLI and linked `t3code` onto PATH.
- Implemented project resolution/creation policy, repo/folder workspace policy, local/worktree setting discovery, short-lived T3 auth sessions, project/thread orchestration, stable JSON envelopes, doctor/config/read commands, and failed-turn cleanup.
- Replaced Delano's copied-prompt T3 behavior with `t3code --json handover --cwd <repo> --stdin --open auto`.
- Added a viewer integration test with a fake `t3code` executable to verify arguments, prompt stdin, and returned project/thread identifiers.

## In Progress

- None for the requested T3 handover path.

## Blockers

- Stable T3 Code v0.0.28 can reveal its desktop window but cannot navigate an external link to the newly-created thread. The thread is created correctly and appears in the project; exact desktop navigation awaits upstream protocol support.
- T3's HTTP API cannot prepare the web UI's new-worktree bootstrap. The CLI fails explicitly when T3's effective thread mode is `worktree` and accepts `--env-mode local` as the current override.

## Next Actions

- Install a real Python runtime before relying on the root `validate.sh --release` gate on this Windows machine; the Windows Store `py.exe` alias is intermittently misdetected and hangs inside the per-project cycle check.
- Consider raising or isolating the unrelated 10-second Codex session-hook test timeout; it passes alone in 3.3 seconds but reaches 10.27 seconds during the parallel 109-test suite.

## Quality Evidence

### Scope

- Standalone `t3code` CLI, live T3 v0.0.28 project/thread behavior, Delano server bridge, handover selector UI, generated viewer assets, and package manifest.

### Risk Level

- High: short-lived administrative T3 authentication, agent-thread creation, process launching, prompt transport, and Windows command resolution.

### Tests Run

- CLI: `pnpm check` — typecheck, 8 Vitest cases, and production build passed.
- Live T3: `t3code --json doctor`, project resolution, dry-run handover, real project creation, real thread creation, and first-turn start passed.
- Viewer integration: 11/11 `viewer-server.test.js` cases passed, including fake-CLI argument/stdin verification.
- UI: TypeScript check, targeted ESLint, and production Vite build passed.
- Packaging: `build:assets` and 215-entry package/manifest drift check passed.
- Browser: Playwright fallback verified the T3 Code menu item and `Send to T3 Code` selected state without invoking Send.
- Full Delano suite: 108/109 passed twice; the sole failure is the pre-existing Codex session-hook test's hard 10-second timeout. The same test passed alone in 3.3 seconds.
- Release validation: contract checks progressed until the Windows Store `py.exe` alias hung during project cycle validation; no real Python runtime is installed.

### Defects Found

- No critical defect in the requested handover path.
- Upstream stable T3 cannot navigate its desktop window directly to an externally created thread and cannot prepare new worktrees through the HTTP API.
- Repo-wide quality debt remains in the load-sensitive session-hook timeout and Python runtime detection.

### Gate Decision

- Requested T3 handover feature: pass.
- Whole-repository release gate: incomplete until Python-backed validation can run and the unrelated full-suite timeout is resolved or rebaselined.

## Outcome Review

### Target Outcome

- Clicking T3 Code handover resolves the current folder/repository to a T3 project, creates the project according to configuration, creates a fresh thread, submits the handover prompt, and opens T3 Code.

### Actual Outcome

- Achieved for local-mode T3 projects. The standalone CLI is installed, Delano invokes it over stdin, a real T3 project/thread/turn was persisted, and the built viewer exposes T3 Code as a remembered primary handover target.

### Delta

- Stable T3 desktop reveal cannot select the newly-created thread exactly.
- Worktree preparation is not exposed by T3's HTTP orchestration handler, so effective worktree mode fails explicitly instead of silently running locally.

### Root Causes

- T3 v0.0.28's `t3code://` second-instance handler only reveals the window.
- T3's worktree bootstrap transform lives in the WebSocket UI dispatch path, not the HTTP dispatch endpoint.

### Follow-up Actions

- Adopt `t3://thread/<id>` automatically when an installed T3 build registers it.
- Replace the worktree limitation when T3 publishes a stable external worktree/thread bootstrap command.

## Closure Checklist

- [x] Required implementation scope resolved (no new Delano task ID was created; the parent project was already complete).
- [x] Scoped quality gates passed.
- [x] Evidence package complete.
- [x] Registry/state reviewed; no lifecycle or external mapping change was required.
- [x] Learning proposals drafted below.
- [x] Learning proposals remain proposed and unadopted pending review.
- [x] No retrospective was requested for this standalone bridge.

## Learning Proposals

### Proposal: bound Python runtime probes

- Proposal type: rule/fixture.
- Rationale: Windows Store command aliases can satisfy a transient interpreter probe and later hang contract validation. Add a bounded interpreter probe and reject Store aliases without a real runtime.
- Target path: `.agents/scripts/pm/validate.sh`.
- Evidence: release validation hung during the per-project Python dependency-cycle check after reporting `py -3` as available.
- Review gate: required before adoption.
- Adoption status: proposed.

### Proposal: isolate the session-hook timing fixture

- Proposal type: fixture.
- Rationale: the Codex SessionStart hook passes alone in 3.3 seconds but exceeds its fixed 10-second limit during the parallel 109-test run. Isolate the fixture or set a load-aware timeout without weakening its assertions.
- Target path: `test/package.test.js`.
- Evidence: two full runs failed at 10.10 and 10.27 seconds; the isolated case passed.
- Review gate: required before adoption.
- Adoption status: proposed.
