---
id: T-001
name: Define annotation storage contract and safe write API
status: ready
workstream: WS-A
created: 2026-06-30T14:12:02Z
updated: 2026-06-30T14:24:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: []
conflicts_with: []
parallel: false
priority: high
estimate: L
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Define annotation storage contract and safe write API

## Description

Add a repo-relative annotation model and viewer endpoints for listing, writing, updating, deleting, and exporting annotations without granting blanket file writes.

## Acceptance Criteria

- [ ] Annotation payloads validate sourcePath, anchor, quote, comment, labels, and author metadata before persistence.
- [ ] Server writes only under the approved annotation store and rejects traversal, absolute paths, symlink escapes, and unknown .project documents.
- [ ] Focused Node tests cover create/list/update/delete/export failure paths.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Plannotator's `packages/shared/external-annotation.ts` and `packages/server/external-annotations.ts` are the closest reference for schema validation, batch create, update/delete operations, snapshot reads, and SSE/polling hooks.
- Delano should persist annotation state separately from canonical markdown, likely under the project contract tree, and treat the markdown file hash as part of any future apply request.
- Path handling must allow only repo-relative `.project` documents that already exist in the viewer index.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-30T14:12:02Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from Plannotator annotation API and Delano viewer safety review.
