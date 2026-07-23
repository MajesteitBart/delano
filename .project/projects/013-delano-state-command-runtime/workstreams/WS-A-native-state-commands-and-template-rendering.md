---
name: WS-A Native State Commands and Template Rendering
owner: delano-team
status: done
created: 2026-05-12T11:25:19Z
updated: 2026-05-12T11:51:28Z
---

# Workstream: WS-A Native State Commands and Template Rendering

## Objective

Provide native CLI state commands that render new artifacts from `.project/templates` and patch existing lifecycle state without full repository validation.

## Owned Files/Areas

- `src/cli/index.js`
- `src/cli/commands/`
- `src/cli/lib/`
- `test/cli.test.js`

## Dependencies

- Existing `.project/templates`
- Existing CLI dispatcher
- Existing status transition validation

## Risks

- Too much behavior in `src/cli/index.js` could become hard to maintain.
- Creation commands must not fork the template shape.
- Patch commands must preserve user-authored markdown.

## Handoff Criteria

- Focused tests prove template-backed creation.
- Focused tests prove patch-only lifecycle transitions.
- Full validation passes before closeout.
