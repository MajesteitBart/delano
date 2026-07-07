# GUI Testing Policy

## Enforcement Mode
- `advisory`

## Smoke Routes
- Context-only, script-only, and contract-only changes do not require GUI smoke evidence.
- Viewer changes do require GUI smoke evidence because `.delano/viewer` is now a real local review surface.
- Start with `delano viewer` or `npm run viewer`, then exercise the Projects dashboard, document reader, task/workstream list pages, annotation drawer, text selection popover, and handover menu.
- For task/workstream handover, check both `start` and `review` menu paths and confirm copy-command fallback status feedback.

## Console Filtering
- Block browser/runtime errors for any UI surface that is introduced.
- Allow only documented, known development-only noise during local testing.
- For viewer checks, record console errors as pass/fail evidence rather than relying only on screenshots.

## Evidence Requirements
- Capture screenshots, console output, and comparison notes only for work that touches `.delano/` or other browser-visible surfaces.
- Script- and contract-only changes do not require GUI evidence.
- Per AGENTS.md, delegate browser testing, GUI smoke checks, and screenshot capture to the Codex CLI (`codex exec`) instead of spawning browser-automation subagents.
- Useful viewer evidence includes desktop and tablet screenshots, selected-text annotation creation, highlight persistence, drawer row edit/delete, handover command generation, and no blocked console errors.

## Design Validation Threshold
- For UI work, critical flows must render correctly, remain usable on supported viewports, and ship without blocked console errors.
- For non-UI work in this repo, this section is not a gating constraint.
- Preserve the quiet Delano/Keendoc-like visual language and avoid overlapping controls, clipped text, stale static assets, or nested scroll regions that hide review actions.
