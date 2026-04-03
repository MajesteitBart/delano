---
id: T-002
name: Probe-aware contracts and operator docs
status: done
created: 2026-04-03T06:43:27Z
updated: 2026-04-03T06:43:27Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-001]
conflicts_with: []
parallel: true
priority: high
estimate: M
---

# Task: Probe-aware contracts and operator docs

## Description

Extend the spec and plan scaffolds with probe-aware fields and sections, and align operator-facing docs so they teach `.agents` as the canonical path while keeping `.claude` as an explicit compatibility layer.

## Acceptance Criteria
- [x] `.project/templates/spec.md` and `.project/templates/plan.md` match the upgraded probe-aware contract.
- [x] `README.md` and shared runtime docs use `.agents/scripts/...` as the canonical operator path.
- [x] Remaining `.claude` references in user-facing docs are compatibility-only.

## Technical Notes

- Updated template files, runtime README files, rules, hooks/log schema notes, and top-level README guidance.
- Kept compatibility wording where `.claude` is intentionally referenced as a mirror or fallback path.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log
- 2026-04-03: Verified generated smoke-project `spec.md` and `plan.md` match the new probe-aware scaffolds.
- 2026-04-03: Completed canonical-path sweep across repo docs and runtime references.
