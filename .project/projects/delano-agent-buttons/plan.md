---
name: Agent Buttons
status: planned
lead: bart
created: 2026-06-17T12:37:43Z
updated: 2026-06-17T14:02:00Z
linear_project_id:
risk_level: medium
spec_status_at_plan_time: planned
---

# Delivery Plan: Agent Buttons

## What Changed After Probe
Initial research already established the core constraint: Codex and Claude Code deep links prefill prompts and workspace context, but they do not execute commands. The design therefore treats agent buttons as safe task starters, not mutation controls.

Oracle review narrowed v1 from a broad page/action matrix to a small proof of the deep-link and read-only safety model. v1 now covers only project overview, task detail, and blocked-task contexts, with provider choices and copy fallback. Lifecycle-specific buttons move out of v1.

Second Oracle review confirmed the narrowed scope and required a small pre-implementation contract patch: explicit endpoint payload, action context schema, prompt length policy, no absolute URL logging, concrete probe gates, and task traceability.

## Technical Context
- Viewer implementation: `.delano/viewer/public/app.jsx`, `.delano/viewer/public/styles.css`, `.delano/viewer/server.js`.
- Current viewer actions are local convenience actions only: open selected markdown in VS Code and open folder.
- Codex target URL: `codex://threads/new?path=<absolute-repo-path>&prompt=<encoded-prompt>`.
- Claude Code target URL: `claude-cli://open?cwd=<absolute-repo-path>&q=<encoded-prompt>`.
- The browser currently receives repo name and `.project` paths, but not the absolute repo root. URL building belongs server-side behind a narrow endpoint or helper so `/api/index` does not expose absolute repo roots.

## Architecture Decisions
- Use one Delano action context model and one shared prompt builder.
- Use provider-specific URL builders for Codex and Claude Code.
- Treat lifecycle actions as future prompt presets that the user reviews in the agent; v1 does not expose lifecycle-specific top-level UI labels.
- Keep prompt bodies identifier-based and command-first.
- Preserve the viewer read-only boundary; no direct `.project` writes from buttons.
- Build deeplinks server-side from a constrained action context; do not add absolute repo root to `/api/index`.

## Policy and Contract Checks
- [ ] `.project` remains the execution source of truth
- [ ] Official-doc URL shape is accepted for T-001; desktop handler behavior is validated in T-005
- [ ] Evidence gates are defined before handoff
- [ ] External sync writes require dry-run or operator approval
- [ ] Agent endpoint returns `provider`, `url`, `prompt`, and `warnings`
- [ ] Agent endpoint accepts only known provider/action enums and `.project` relative source paths
- [ ] Generated absolute-path provider URLs are not logged, snapshotted, documented, or exposed through `/api/index`

## Generated Artifact Map
- `spec.md`: Created from `.project/templates` by `delano project create`.
- `plan.md`: Created from `.project/templates` by `delano project create`.
- `workstreams/`: Created from `.project/templates` by `delano project create`.
- `tasks/`: Created from `.project/templates` by `delano project create`.

## Complexity Exceptions
- None recorded.

## Probe-Driven Architecture Changes
- Add a minimal probe for URL construction before UI rollout.
- Verify local handler behavior manually for Codex and Claude Code where possible.
- Keep the VS Code Claude handler out of v1 because it cannot reliably set `cwd`.
- Prove the v1 safety model with project, task, and blocker contexts before adding row-level action surfaces.

## Workstream Design
- WS-A Deep Link Foundation: server-side repo context, constrained action context, provider-specific URL generation, fallback prompt copying.
- WS-B Prompt And Command Presets: v1 prompt bodies for carry-project-forward, carry-task-forward, and investigate-blocker.
- WS-C Viewer Agent UI: Agent menu placement on project overview, task detail, and blocked-task contexts.
- WS-D Validation And Documentation: tests, browser smoke, docs, and read-only boundary checks.

## Milestone Strategy
- Milestone 1: Build and test URL/prompt generation without UI changes.
- Milestone 2: Add a small Agent menu to project overview, task detail, and blocked-task contexts only.
- Milestone 3: Evaluate usage and UI density before adding any row-level expansion beyond blocked/open task contexts.
- Milestone 4: Add docs, fallback copy behavior, and browser smoke evidence.

## Rollout Strategy
- Start with local-only deep links using absolute repo path.
- Gate row-level UI behind compact menus to avoid clutter.
- Prefer one safe generic "Carry forward with agent" action before specialized close/reopen presets.
- Add provider preference/settings only after the basic feature proves useful.

## Test Strategy
- Unit-test Codex and Claude Code URL encoding.
- Unit-test prompt templates for v1 project, task, and blocker actions.
- Snapshot-test generated prompts for all v1 actions and assert they stay under configured length thresholds.
- Test prompt soft warnings above 3,500 characters and hard fallback before Claude Code's 5,000-character `q` limit.
- Browser-smoke project overview, task detail, and blocked-task contexts for visible Agent controls and non-overlap.
- Verify no agent button POST route writes `.project`.
- Run `delano validate` after contract changes and normal package tests after implementation.

## Rollback Strategy
- Agent button UI can be hidden by removing menu entry wiring while keeping prompt builders unused.
- URL builder and prompt template modules should be isolated so they can be reverted without affecting viewer indexing.
- Existing open-in-IDE and open-folder actions should remain untouched.

## Remaining Delivery Risks
- Custom URL schemes may behave differently across browser/desktop combinations.
- Per-row actions can add visual noise; v1 avoids broad table rollout until usage justifies it.
- Prompt templates can become too long if they include raw markdown instead of references.
- Server-side exposure of absolute repo path must stay local, intentional, and absent from `/api/index`, docs, fixtures, and snapshots.
