---
id: T-007
name: Create Updated Files view and inspector
status: planned
workstream: WS-C
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T07:59:24Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: [T-002 T-003]
conflicts_with: [.delano/viewer/ui/src/pages/UpdatedFilesPage.tsx, .delano/viewer/ui/src/components/organisms/FileActivityInspector.tsx]
parallel: true
priority: high
estimate: M
operating_mode: feature
story_id: US-004
acceptance_criteria_ids: [AC-003, AC-007]
---

# Task: Create Updated Files view and inspector

## Description

Build the Git-provenanced file activity table and contextual inspector for working-tree and recent commit records, including document joins and safe open actions.

## Acceptance Criteria

- [ ] Every activity row shows repo-relative path, change kind, source provenance, and correct working/commit timestamp without checkout-mtime ambiguity
- [ ] Search, source/change/project/time filters, stable sorting, pagination, refresh, and Git-unavailable state work per the approved design
- [ ] Inspector exposes commit/path context and safe IDE/folder actions; exact .project markdown matches can open in the existing reader

## Traceability
- Story: US-004
- Acceptance criteria: AC-003 AC-007

## Technical Notes

- Working-tree and commit timestamps are different provenance and must stay visibly labeled.
- The table may flatten commit-file records for sorting/filtering, while the inspector restores commit grouping and metadata.
- Exact `.project` markdown matches can call the current document route. Other files use existing safe open-in-IDE/folder patterns; no arbitrary file editor is added.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
