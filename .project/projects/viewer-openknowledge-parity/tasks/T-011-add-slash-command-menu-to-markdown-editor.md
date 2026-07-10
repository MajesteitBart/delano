---
id: T-011
name: Add slash command menu to Markdown editor
status: done
workstream: WS-B
created: 2026-07-10T15:53:28Z
updated: 2026-07-10T17:57:28Z
linear_issue_id:
github_issue:
github_pr:
depends_on: [T-004, T-005]
conflicts_with: [viewer-editor]
parallel: false
priority: medium
estimate: S
operating_mode: feature
story_id:
acceptance_criteria_ids: []
---

# Task: Add slash command menu to Markdown editor

## Description

Add a compact slash-command menu to the TipTap Markdown editor. Typing / at the start of a text block should open an editor-native command list built with an existing Shadcn/Radix menu primitive, without requiring right-click.

## Acceptance Criteria

- [x] Typing / at the start of an empty or current text block opens a menu at the insertion point; ordinary slashes in existing text do not trigger it.
- [x] The menu offers headings, bulleted list, numbered list, task list, blockquote, code block, and horizontal rule commands, and filters as the user types after /.
- [x] Arrow keys move through options, Enter applies the highlighted command, Escape closes the menu, and pointer selection works with accessible labels and visible focus.
- [x] Applying a command removes the slash query, runs the matching TipTap command, closes the menu, and returns focus to the editor.
- [x] Focused automated coverage verifies triggering, filtering, selection, and dismissal; UI typecheck and production build pass.

## Traceability
- Story: none
- Acceptance criteria: none

## Technical Notes

Use the existing Shadcn/Radix component system rather than a custom popup. Prefer a dropdown/popover-style menu anchored to the editor caret for the `/` interaction; `ContextMenu` may share the command-item presentation or provide an optional right-click entry, but the feature must not require right-click. Keep the command definitions separate from menu rendering so trigger and command behavior can be tested without browser-only assertions.

## Definition of Done
- [x] Implementation complete
- [x] Tests pass
- [x] Review complete
- [x] Docs updated

## Evidence Log

- 2026-07-10T17:57:28Z: Implemented caret-anchored Shadcn/Radix Popover menu with block-start-only slash trigger, live filtering, Heading 1/2/3, bullet, numbered, task, quote, code, and horizontal-rule commands; arrow/Enter/Escape plus pointer handling; ARIA listbox/options; query deletion and editor refocus. npm run test:editor: 5/5 pass. npm run typecheck: pass. Targeted ESLint: pass. Prettier check: pass. npm run build: pass. output/t011-slash-command-smoke.png confirms built menu. Full UI lint remains nonzero on 9 unrelated pre-existing errors; delano validate passed project/contract gates and failed only unrelated pre-existing .claude mirror drift; browser delegate timed out.

- 2026-07-10T17:43:27Z: Dependencies T-004 and T-005 are done; editor files are clean and T-011 is dependency-safe.

- 2026-07-10T15:57:24Z: Task definition validated: status transitions, artifact schemas, operating modes, evidence map, and git diff whitespace checks passed; full delano validate timed out after 180 seconds without output on this Windows environment.
- 2026-07-10T15:53:28Z: Created from .project/templates/task.md by `delano task add`.
