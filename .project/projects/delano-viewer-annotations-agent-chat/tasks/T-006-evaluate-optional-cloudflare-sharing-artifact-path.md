---
id: T-006
name: Evaluate optional Cloudflare sharing artifact path
status: ready
workstream: WS-C
created: 2026-06-30T14:12:17Z
updated: 2026-06-30T14:24:00Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-003]
conflicts_with: []
parallel: true
priority: medium
estimate: M
operating_mode: uncertain-feature
story_id:
acceptance_criteria_ids: []
---

# Task: Evaluate optional Cloudflare sharing artifact path

## Description

Research and, if approved, add an opt-in encrypted sharing/export path for annotation bundles without making hosted sharing a default dependency.

## Acceptance Criteria

- [ ] Plan documents privacy, retention, payload-size, and offline/self-hosted fallback behavior before any remote upload is enabled.
- [ ] Sharing can be disabled and local copy/download/export remains fully functional.
- [ ] If implemented, shared artifacts contain annotation bundles, not unbounded local repo state or secrets.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes
- Plannotator's `packages/ui/utils/sharing.ts` demonstrates compressed encrypted sharing URLs and paste-service fallback, but Delano should not adopt hosted sharing as a default until privacy and retention rules are explicit.
- Local copy/download must remain the primary implementation path.
- If a hosted artifact path is approved, the payload should be an annotation bundle only, not arbitrary repository files.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log
- 2026-06-30T14:12:17Z: Created from .project/templates/task.md by `delano task add`.
- 2026-06-30T14:24:00Z: Research folded forward from Plannotator sharing flow and Delano local-first safety constraints.
