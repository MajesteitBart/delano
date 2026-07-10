---
id: T-001
name: Approve viewer work overview designs
status: in-progress
workstream: WS-A
created: 2026-07-10T07:59:24Z
updated: 2026-07-10T09:06:28Z
linear_issue_id: 
github_issue: 
github_pr: 
depends_on: []
conflicts_with: [output/design/delano-viewer-work-overview/**]
parallel: false
priority: high
estimate: M
operating_mode: feature
story_id: US-006
acceptance_criteria_ids: [AC-008]
---

# Task: Approve viewer work overview designs

## Description

Create six separate horizontal viewer-native mockups, iterate every screen with Fable through the Claude CLI until each scores at least 9/10, record privacy-safe evidence, and obtain user feedback before code execution.

## Acceptance Criteria

- [ ] Six separate horizontal images exist for Home, Review, Plan, Updated Files, filtered table state, and file/detail inspector in the user-supplied current viewer chrome
- [ ] Every final current-chrome image has a recorded Fable score of at least 9/10 with the scored artifact unambiguous
- [ ] User feedback is requested with links to all final artifacts and no implementation task is opened before approval

## Traceability
- Story: US-006
- Acceptance criteria: AC-008

## Technical Notes

- Use the required `imagegen-frontend-app` skill and generate exactly one 16:10 image per screen, never a collage.
- Lock the system from the plan: Working Chrome, quiet premium-neutral light theme, hairline surfaces, Inter/JetBrains Mono, precision-instrument character, and the existing slim contextual sidebar.
- Store a concise design brief, every final image, and privacy-safe Fable score record under `output/design/delano-viewer-work-overview/`.
- Run Fable through the local Claude CLI. Reviews must include an exact artifact manifest and score six rubric dimensions: viewer fidelity, workflow clarity, interaction legibility, implementation specificity, accessibility, and data realism.
- Do not check the final acceptance criterion or close this task until the user responds to the mockups.

## Definition of Done
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Review complete
- [ ] Docs updated

## Evidence Log

- 2026-07-10: User feedback rejected the first set's shell drift and supplied six 1920×1080 current-viewer screenshots. The sidebar, lowercase leaf logo, top bar, centered content column, tables, and drawer anatomy are now locked to those references. Prior scores remain iteration evidence but no longer satisfy the final design gate.

- 2026-07-10T09:06:28Z: User rejected shell drift and supplied six current-viewer screenshots at 1920x1080/100% zoom. The exact existing sidebar, lowercase leaf logo, 56px top bar, centered page column, table, and drawer anatomy now supersede the first mockup set; redo all six and rerun Fable.

- 2026-07-10T08:54:08Z: Fable design gate passed for exact final mockups: Home 9.1, Review 9.0, Plan 9.1, Updated Files 9.1, Filtered Projects 9.2, File Inspector 9.2. User feedback remains pending; implementation tasks remain planned.

- 2026-07-10: Generated six separate 16:10 viewer-native images with the required imagegen workflow under `output/design/delano-viewer-work-overview/`. Fable reviewed exact SHA-256 manifests through the Claude CLI. V1 failed five screens on data coherence; V2 passed five and left one pagination arithmetic defect; Updated Files V3 corrected the pager and passed at 9.1. Final scores: Home 9.1, Review 9.0, Plan 9.1, Updated Files 9.1, Filtered Projects 9.2, File Inspector 9.2. Full evidence: `output/design/delano-viewer-work-overview/fable-review.md`. User feedback remains pending; no implementation task has been opened.

- 2026-07-10T08:01:05Z: Generate six viewer-native mockups and iterate every screen with Fable before requesting user feedback.

- 2026-07-10T08:01:05Z: Spec, plan, and dependency graph are complete; begin the user-requested mockup and Fable approval gate.
- 2026-07-10T07:59:24Z: Created from .project/templates/task.md by `delano task add`.
