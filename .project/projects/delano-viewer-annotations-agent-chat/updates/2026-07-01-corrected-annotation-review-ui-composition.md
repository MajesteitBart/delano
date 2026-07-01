---
timestamp: 2026-07-01T00:22:40Z
status: done
task: T-010
stream: WS-D
---

# Progress Update

## Completed
- Replaced the manual fixed annotation entry card with a shadcn/Radix `Popover` anchored to the current text selection.
- Tightened the annotation rail, selected-row state, chat empty area, and document typography so the page reads as a restrained shadcn product surface instead of custom blue-block UI.
- Changed chat attachment behavior so only checked annotations count as attachments.
- Centered the single-column tablet layout to avoid the old squeezed-content failure mode.
- Browser evidence captured under `.project/viewer/screenshots/`, including `screenshot-1782865060075.png` for desktop, `screenshot-1782865104388.png` for selected-row state, `screenshot-1782864944890.png` for the Popover, and `screenshot-1782865270935.png` for tablet.
- Validation passed: `npm --prefix .delano/viewer/ui run typecheck`; `npm --prefix .delano/viewer/ui run build`; `npm run build:assets`; `node --test test\viewer-server.test.js`; `npm run check:package-manifest`.

## In Progress
- None

## Blockers
- None

## Next Actions
- Review live at `http://127.0.0.1:3980/`.
