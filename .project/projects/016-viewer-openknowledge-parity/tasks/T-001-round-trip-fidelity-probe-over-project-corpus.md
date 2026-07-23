---
id: T-001
name: Round-trip fidelity probe over .project corpus
status: done
workstream: WS-A
created: 2026-07-09T23:58:19Z
updated: 2026-07-10T00:34:12Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: []
parallel: true
priority: high
estimate: S
operating_mode: feature
story_id: US-001
acceptance_criteria_ids: ["AC-003"]
---

# Task: Round-trip fidelity probe over .project corpus

## Description

Build a Node probe harness that parses every committed `.project/**/*.md` body through the TipTap schema + `@tiptap/markdown` (parse -> serialize) and reports semantic drift per file plus frontmatter byte-identity. This gates all WS-B build tasks (plan M1).

## Acceptance Criteria
- [x] Harness script lives under `.delano/viewer/ui/scripts/` (or `scripts/`) and runs with one command
- [x] Report covers 100% of committed `.project/**/*.md` files with per-file pass/drift detail
- [x] Frontmatter is byte-identical for every file after split/reattach
- [x] Zero semantic drift, or each drift case has a recorded mitigation decision in decisions.md

## Traceability
- Story: US-001
- Acceptance criteria: AC-003

## Technical Notes

Semantic compare: normalize insignificant whitespace, compare heading/list/table/code/link structure (e.g. via mdast from remark or structural re-parse). Delegate implementation to Codex; Claude reviews the drift report and makes fallback decisions.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T00:34:12Z: Codex-run roundtrip-probe.mjs over 334 committed .project md files: 0 parse errors, 0 frontmatter failures, 5 minor normalization cases documented in spec Probe Findings and D-003. Report at output/roundtrip-probe-report.json.

- 2026-07-10T00:13:43Z: Task started with `delano task start`.
- 2026-07-09T23:58:19Z: Created from .project/templates/task.md by `delano task add`.
