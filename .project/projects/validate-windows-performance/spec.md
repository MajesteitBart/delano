---
name: Fast Contract Validation on Windows
slug: validate-windows-performance
owner: MajesteitBart
status: complete
created: 2026-07-14T15:24:35Z
updated: 2026-07-14T15:34:29Z
outcome: Contract validation completes in under 30 seconds for a synthetic portfolio of 25 projects and 250 tasks on the affected Windows environment while preserving existing validation behavior.
uncertainty: low
probe_required: false
probe_status: skipped
probe_decision_rationale: Issue reproduction and source inspection already identify repeated per-field awk process spawning as the bottleneck, so no separate prototype is needed.
operating_mode: scoped-change
---

# Spec: Fast Contract Validation on Windows

## Executive Summary

Replace repeated shell frontmatter reads in the contract-validation loop with one process that parses every contract once. Preserve current validation messages, required fields, timestamp rules, workstream references, and dependency-cycle checks.

## Problem and Users

On Git Bash for Windows, process creation is expensive. The validator currently launches `awk` once per required field and once per frontmatter-presence check, causing large portfolios to take minutes and appear hung. Delano operators need validation time to scale with contract content rather than subprocess count.

## Outcome and Success Metrics

- A synthetic portfolio containing 25 projects and 250 tasks validates in under 30 seconds on the affected Windows environment.
- Contract frontmatter is parsed at most once per file during core project validation.
- Existing required-field, timestamp, workstream-reference, and dependency-cycle behavior remains covered by automated tests.

## User Stories
- US-001: As a Windows operator, I want `delano validate` to finish predictably on a large portfolio, so that I can distinguish validation failures from a hung process.

## Acceptance Scenarios
- AC-001: Given 25 valid projects with 10 valid tasks each, when validation runs on Windows, then it exits successfully in under 30 seconds.
- AC-002: Given a contract with a missing required field, invalid UTC timestamp, missing workstream, or task dependency cycle, when validation runs, then the corresponding existing error is still reported.

## Scope
### In Scope

- Core project/spec/plan/task frontmatter validation in `.agents/scripts/pm/validate.sh`.
- Regression tests using a generated multi-project fixture.
- Generated Claude compatibility mirror and npm payload refresh.

### Out of Scope

- Rewriting unrelated PM shell commands that still use `awk`.
- Changing contract schemas or validation policy.
- Adding user-configurable timing output.

## Functional Requirements

- Parse each project contract file once for the core project-validation phase.
- Report the same categories of contract errors as the current validator.
- Return a non-zero validator status when any contract error is found.

## Non-Functional Requirements

- Use a runtime already required by Delano.
- Keep the validation implementation portable across Windows Git Bash, macOS, and Linux.
- Avoid introducing third-party dependencies.

## Assumptions
- Python 3 remains a required runtime for the shell validator.
- A 25-project/250-task synthetic portfolio is large enough to detect a regression to per-field process spawning.

## Needs Clarification
- None recorded at creation.

## Hypotheses and Unknowns

- One Python process can preserve validation behavior while removing the dominant Windows process-launch overhead.

## Touchpoints to Exercise

- `.agents/scripts/pm/validate.sh`
- `.claude/scripts/pm/validate.sh`
- `assets/payload/.agents/scripts/pm/validate.sh`
- `test/package.test.js`

## Probe Findings

- The issue report measured roughly 4.6 seconds for 100 trivial `awk` launches on the affected environment.
- Source inspection confirms repeated `fm_get` and `has_frontmatter` calls inside project and task loops.

## Footguns Discovered

- Command substitution strips trailing newlines; parsed scalar behavior must remain equivalent for current frontmatter.
- Compatibility and packaged runtime copies are generated and must not be edited directly.

## Remaining Unknowns

- None blocking implementation.

## Dependencies

- Python 3 runtime resolution already implemented by `validate.sh`.

## Approval Notes

- 2026-07-14T15:34:30Z: Project closed with `delano project close`.

- 2026-07-14T15:25:24Z: Spec approved from GitHub issue #25; execution scope and success metrics are explicit.

- User requested the fix through GitHub issue #25.
