---
name: Delano State Command Runtime
slug: 013-delano-state-command-runtime
owner: delano-team
status: complete
created: 2026-05-12T11:25:19Z
updated: 2026-06-09T21:24:22Z
outcome: Delano has native CLI state commands that create artifacts from `.project/templates` and patch lifecycle state without running full validation for every normal transition.
uncertainty: medium
probe_required: false
probe_status: skipped
probe_decision_rationale: Probe skipped: scoped implementation over existing templates and validators with no new technical unknowns.
---

# Spec: Delano State Command Runtime

## Executive Summary

Delano should use its own project contracts as the source of truth for everyday state changes. Creation commands should render `.project/templates` so artifact shapes stay centralized. Lifecycle commands should patch existing artifacts and apply local rollups instead of regenerating files or running repository-wide validation.

## Problem and Users

- US-001: As an operator, I want `delano project create`, `workstream add`, `task add`, and `update add` to use `.project/templates`, so generated artifacts never drift from the canonical contract shape.
- US-002: As an agent, I want `start`, `close`, `block`, `defer`, and `update` commands to patch existing artifacts, so normal state transitions are fast and preserve user-authored content.
- US-003: As a maintainer, I want scoped lifecycle rollups, so task changes keep workstream, spec, and plan status coherent without validating the entire repository.

## Outcome and Success Metrics

- Creation commands use `.project/templates/spec.md`, `plan.md`, `workstream.md`, `task.md`, and `progress-update.md`.
- Patch commands do not regenerate artifacts from templates.
- Task lifecycle commands enforce local dependency and evidence requirements.
- Workstream and project lifecycle rollups happen automatically for affected files.
- Focused tests prove template-backed creation and patch-only lifecycle behavior.
- `delano validate` remains green after implementation.

## User Stories
- US-001: As an operator, I want generated project artifacts to come from `.project/templates`, so the templates are the single source of truth.
- US-002: As an agent, I want scoped state commands, so I can perform normal transitions without expensive full validation.
- US-003: As a maintainer, I want lifecycle rollups to happen automatically, so manual status drift is harder to create.

## Acceptance Scenarios
- AC-001: Given `.project/templates/spec.md` and `plan.md`, when `delano project create <slug>` runs, then the new project files are rendered from those templates with placeholders replaced.
- AC-002: Given `.project/templates/workstream.md`, when `delano workstream add <project> <ws-id>` runs, then a workstream file is rendered from that template.
- AC-003: Given `.project/templates/task.md`, when `delano task add <project> <task-id>` runs, then a task file is rendered from that template.
- AC-004: Given `.project/templates/progress-update.md`, when `delano update add <project>` runs, then an update file is rendered from that template.
- AC-005: Given an existing task, when lifecycle commands run, then only affected existing artifacts are patched and no template regeneration occurs.

## Scope
### In Scope

- Native CLI command routing for `project`, `workstream`, `task`, and `update`.
- Template rendering for creation/add commands.
- Patch-only lifecycle commands for project, workstream, and task status changes.
- Scoped dependency, blocker, evidence, and lifecycle rollup checks.
- Focused tests and validation evidence.

### Out of Scope

- Replacing `delano validate` as the full repository audit gate.
- External Linear/GitHub writes.
- A full TUI or interactive workflow.
- Rewriting all legacy shell scripts in this slice.

## Functional Requirements

- Project creation must render `spec.md` and `plan.md` from `.project/templates`.
- Workstream creation must render from `.project/templates/workstream.md`.
- Task creation must render from `.project/templates/task.md`.
- Update creation must render from `.project/templates/progress-update.md`.
- Lifecycle transitions must patch existing frontmatter and append evidence/update content where appropriate.
- Task start/close must reject unresolved dependencies.
- Task close must require evidence.
- Task block must require `blocked_owner` and `blocked_check_back`.
- Rollups must keep affected workstream, spec, and plan statuses coherent.

## Non-Functional Requirements

- Commands should read and write only affected project artifacts.
- Template rendering should be simple, deterministic, and offline.
- Commands must preserve user-authored markdown outside patched frontmatter/evidence sections.
- Generated artifacts must remain portable and free of local absolute path references.

## Assumptions
- Existing `.project/templates` are the canonical artifact skeletons.
- Full validation remains available as `delano validate`.
- Scoped commands may offer `--json` for agents.

## Needs Clarification
- Whether `project update` should support arbitrary frontmatter fields in this slice or only lifecycle status.
- Whether update filenames should be timestamp-based or task-based by default.

## Hypotheses and Unknowns

- Hypothesis: a small native project-state layer can remove the need for most shell-based state writes.
- Hypothesis: template-backed creation will reduce drift in generated artifacts.
- Unknown: exact long-term command names after real use.

## Touchpoints to Exercise

- `src/cli/index.js`
- Future `src/cli/commands/*` and `src/cli/lib/*` extraction points
- `.project/templates/*.md`
- `test/cli.test.js`
- `scripts/check-status-transitions.mjs`

## Probe Findings

No separate probe required. This work is a scoped implementation over existing templates and validators.

## Footguns Discovered

- Inline generators can silently drift away from `.project/templates`.
- Direct lifecycle edits can make workstream/project status stale.
- Putting all logic into `src/cli/index.js` would work short-term but would make the command runtime hard to maintain.

## Remaining Unknowns

- Whether legacy `init`, `research`, and `import-spec-kit` wrappers should be redirected to native commands in this same release or follow-up.

## Dependencies

- `.project/templates`
- Existing CLI command dispatcher
- Existing status transition validation

## Approval Notes

Requested after identifying that Delano should use its own method and template source of truth for state-changing commands.
