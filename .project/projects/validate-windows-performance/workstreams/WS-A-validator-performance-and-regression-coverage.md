---
id: WS-A
name: WS-A Validator performance and regression coverage
owner: MajesteitBart
status: done
created: 2026-07-14T15:25:25Z
updated: 2026-07-14T15:34:29Z
operating_mode: scoped-change
---

# Workstream: WS-A Validator performance and regression coverage

## Objective

Make core contract validation scale linearly by parsing each Markdown file once, with regression coverage for large portfolios and existing error behavior.

## Owned Files/Areas

- `.agents/scripts/pm/validate.sh`
- `test/package.test.js`
- Generated `.claude` mirror and `assets/payload`
- Delivery evidence under this project

## Dependencies

- Approved issue-25 spec and plan.
- Existing Python 3 runtime resolution.

## Risks

- Behavioral drift in edge-case frontmatter parsing.
- Flaky timing assertions if the threshold is too tight.

## Handoff Criteria

- Performance regression fixture passes below 30 seconds.
- Existing and new package tests pass.
- Canonical runtime, compatibility mirror, and package payload are synchronized.
- Full contract validation and package-manifest checks pass.
