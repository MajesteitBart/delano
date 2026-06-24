---
name: Agent Buttons
slug: delano-agent-buttons
owner: team
status: planned
created: 2026-06-17T12:37:43Z
updated: 2026-06-17T14:02:00Z
outcome: Delano viewer users can open Codex or Claude Code from project overview, task detail, and blocked-task contexts with safe, reviewable prompts for carrying work forward.
uncertainty: medium
probe_required: true
probe_status: pending
---

# Spec: Agent Buttons

## Executive Summary
Add contextual agent launch buttons to the Delano viewer so an operator can move from a visible project, task, or blocker into Codex or Claude Code with the right local repo and a safe prefilled prompt. v1 proves the deeplink, repo-context, and read-only safety model before any broad viewer rollout.

The feature should preserve the viewer's read-only contract. Buttons must not mutate `.project` state directly. They should open an agent session with concise instructions to inspect the relevant Delano contracts and run the appropriate Delano CLI command only after the agent has checked preconditions.

## Problem and Users
The Delano viewer is good at showing delivery state, but the handoff from "I see the next thing" to "an agent should carry this forward" is manual. Users currently need to copy task IDs, source paths, and command intent into Codex or Claude Code themselves.

The primary user is a Delano operator reviewing local project state. Their objective is usually one of:
- decide the next safe action;
- continue an open task;
- investigate or clear a blocker;
- carry a project forward from its overview.

## Outcome and Success Metrics
- Viewer users can open Codex or Claude Code from project overview, task detail, and blocked-task contexts with prefilled, reviewable prompts.
- Agent prompts include the repo, project slug, task/workstream IDs, source path, and first Delano CLI commands to inspect state.
- No viewer action writes `.project` state directly.
- Lifecycle verbs are not top-level viewer actions; any lifecycle commands appear only inside reviewable, evidence-gated prompts.
- Generated links are short enough for documented Claude Code limits and correctly URL-encoded.

## User Stories
- US-000: As an operator, I want to open an agent from a project overview, so the agent can inspect the project contract and identify the next safe task.
- US-001: As an operator, I want to open an agent from a task detail page, so the agent already knows which task, workstream, and project to inspect.
- US-002: As an operator, I want blocked-task rows to launch a blocker investigation prompt, so the agent checks dependencies and owner/check-back metadata before reopening or re-blocking.
- US-003: As an operator, I want copy-prompt fallback for every agent deeplink, so custom URL handler failures do not strand the workflow.

## Acceptance Scenarios
- AC-000: Given a project overview page, when the user chooses Codex or Claude Code, then the provider opens with a prefilled carry-project-forward prompt containing project slug, source path, and Delano CLI inspection commands.
- AC-001: Given a task detail page, when the user chooses Codex, then Codex opens a new local thread for the repo with a prefilled prompt containing project slug, task ID, source path, and Delano CLI inspection commands.
- AC-002: Given the same task context, when the user chooses Claude Code, then Claude Code opens with the repo as `cwd` and a prefilled prompt containing the same Delano context.
- AC-003: Given a blocked task, when the generated prompt is reviewed, then it instructs the agent to inspect dependencies, `blocked_owner`, and `blocked_check_back` before using `delano task open`, `delano task block`, or `delano task update`; if blocker metadata is missing, the viewer offers copy/explain guidance instead of a lifecycle-oriented deeplink.
- AC-004: Given any v1 context, when the user opens the Agent menu, then the visible choices are provider/fallback choices such as "Open in Codex", "Open in Claude Code", and "Copy prompt", not lifecycle verbs like Start, Close, Block, Reopen, or Defer.
- AC-005: Given missing or unsafe action context, when an agent action would be generated, then the viewer fails closed by omitting the action or offering copy/explain-only prompt text.
- AC-006: Given any agent button, when clicked, then the viewer remains read-only and does not write `.project` files itself.
- AC-007: Given a valid constrained action context and provider, when the viewer requests an agent action, then the server returns `provider`, `url`, `prompt`, and `warnings` without adding repo root to `/api/index`.

## Scope
### In Scope
- Codex app deep links using `codex://threads/new` with encoded `path` and `prompt`.
- Claude Code deep links using `claude-cli://open` with encoded `cwd` and `q`.
- A shared Delano prompt builder with provider-specific URL builders generated server-side from a constrained action context.
- v1 agent actions on project overview, task detail, and blocked-task contexts only.
- v1 prompt presets for carry-project-forward, carry-task-forward, and investigate-blocker only.
- Copy-prompt fallback for every provider deeplink.
- Docs and tests/smoke checks for URL shape, prompt guardrails, and the viewer read-only boundary.

### Out of Scope
- One-click command execution from the browser.
- Remote/cloud agent execution.
- Automatic GitHub, Linear, or external-system writes.
- Progress, warning, validation, context/template, source-document, workspace-table, and workstream-detail agent actions.
- Separate lifecycle-specific UI actions such as Start, Close, Block, Reopen, Defer, Validate, Add update, and Research.
- Stable shareable viewer URLs unless required by implementation.
- Shareable cross-machine deeplinks using `originUrl` or `repo`.
- Preferred/default agent settings.
- Claude Code VS Code handler support in the first pass.

## Functional Requirements
- Generate provider-specific links from the same action context.
- Generate deeplinks server-side from a constrained action context; the general `/api/index` payload must not expose the absolute repo root.
- Include absolute repo path only in the generated local provider URL returned for the requested action.
- Include the narrowest artifact context available: project slug, workstream ID, task ID, `.project` relative path, and status.
- Keep generated prompt text concise and command-first.
- Make the action labels honest: "Open in Codex", "Open in Claude Code", or "Copy prompt", not "Run".
- Agent buttons must never be labeled with lifecycle verbs that imply the viewer mutates state. Lifecycle verbs may appear inside reviewable prompts only.
- Use Delano CLI lifecycle commands in prompts instead of telling agents to edit frontmatter by hand.
- Offer fallback copyable prompt/command text when custom URL schemes are unavailable.
- Use an "Agent" or context-specific "Carry forward with agent" / "Investigate blocker with agent" menu label with provider choices inside the menu.
- Users must be able to inspect prompt text through the copy-prompt fallback, and provider deeplinks must prefill but not auto-submit prompts.

## Action Context Schema
The server-side builder accepts only constrained action context:

- `provider`: `codex` or `claude`.
- `actionType`: `carry-project-forward`, `carry-task-forward`, or `investigate-blocker`.
- `projectSlug`: required.
- `sourcePath`: required, normalized, `.project`-relative, and resolved server-side.
- `workstreamId`: optional for project actions, required when known for task and blocker actions.
- `taskId`: required for task and blocker actions.
- `status`: required when available from the viewer state.
- `blockedOwner` and `blockedCheckBack`: required for blocker lifecycle-oriented prompts; missing values must produce a safe copy/explain response rather than a reopen/block prompt.

The client may send identifiers and `.project` relative paths only. The server resolves the absolute repo root, verifies source paths, rejects path traversal, rejects unknown actions/providers, and returns `provider`, `url`, `prompt`, and `warnings`.

## Non-Functional Requirements
- Do not leak absolute local paths into docs, public examples, or committed generated examples.
- Do not log generated absolute-path provider URLs in normal server logs, client telemetry, debug output, fixtures, snapshots, or docs.
- Keep UI controls compact enough for existing table and sidebar layouts.
- Preserve keyboard and screen-reader usability for action menus.
- Keep URL generation deterministic and unit-testable.
- Fail closed when required context is missing: show no lifecycle action or use an explanation prompt.
- Soft-warn when generated prompts exceed 3,500 characters and hard-fail to copy/explain fallback before Claude Code's 5,000-character `q` limit.

## Assumptions
- Project scope and ownership remain accurate as execution starts.
- The viewer is local and can safely use an absolute repo path inside generated clickable links, but not inside general viewer index payloads, docs, fixtures, or snapshots.
- Users have already installed or configured Codex app and/or Claude Code URL handlers.
- The agent will still require user review, submit, and normal tool approvals after the deeplink opens.

## Needs Clarification
- Which Linux desktop/browser combinations open `claude-cli://` and `codex://` most reliably from the local viewer?

## Hypotheses and Unknowns
- Hypothesis: An "Agent" split menu is less noisy than always-visible Codex and Claude buttons on every row.
- Hypothesis: A 3,500-character soft warning keeps prompts reviewable while leaving headroom below Claude Code's documented 5,000-character `q` limit.

## Touchpoints to Exercise
- Project overview.
- Task detail/document reader.
- Blocked-task context from task detail or blocker list.

## Probe Findings
- Official docs say both Codex and Claude Code links prefill prompts rather than execute automatically.
- Codex uses `codex://threads/new?path=<absolute-path>&prompt=<encoded-prompt>`.
- Claude Code uses `claude-cli://open?cwd=<absolute-path>&q=<encoded-prompt>`.
- Claude Code documents a 5,000 character `q` limit and warns users to review long prompts.

## Footguns Discovered
- Direct browser-triggered lifecycle writes would violate the viewer's read-only contract.
- If prompts embed too much markdown, Claude Code links can exceed documented limits and both tools become harder to review.
- `project close`, `workstream close`, and `task close` need precondition checks and evidence.
- Block actions need owner and check-back values; the UI should not invent them.
- Some renderers strip custom URL schemes, so docs need copy/paste fallbacks.

## Remaining Unknowns
- Exact handler behavior across local browser/desktop combinations.
- Whether a later UI should add preferred-provider settings after v1 usage feedback.

## Dependencies
- Official Codex app deep link behavior.
- Official Claude Code deep link behavior.
- Existing Delano viewer React app and local Node server.
- Existing Delano CLI lifecycle commands.

## Approval Notes
- This project should start with a small local probe before full UI rollout.
- Keep the viewer read-only boundary intact.
