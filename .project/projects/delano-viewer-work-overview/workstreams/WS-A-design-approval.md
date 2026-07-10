---
id: WS-A
name: WS-A Design Approval
owner: Bart
status: active
created: 2026-07-10T07:59:23Z
updated: 2026-07-10T08:01:05Z
operating_mode: feature
---

# Workstream: WS-A Design Approval

## Objective

Retire the high-judgment information-architecture and visual-composition risk before implementation by producing a complete viewer-native six-screen design set, securing Fable scores of at least 9/10 per final screen, and obtaining explicit user feedback.

## Owned Files/Areas

- `output/design/delano-viewer-work-overview/**`
- Design evidence in T-001 and project updates

## Dependencies

- Approved spec and delivery plan
- `imagegen-frontend-app` workflow
- Claude CLI access to Fable

## Risks

- Image text may be imperfect; score workflow clarity and implementation intent, and keep exact labels in a companion brief.
- Fable could grade an obsolete iteration; every review request must identify exact filenames and checksums or dimensions.
- Design iteration can sprawl; change only screens below 9/10 or screens affected by a shared-system critique.

## Handoff Criteria

- Six separate horizontal final images are present under the owned output path.
- Fable's final per-screen scores are all at least 9/10 and recorded against exact artifacts.
- The user has received all six artifacts and their decision is captured before T-002 through T-009 become executable.
