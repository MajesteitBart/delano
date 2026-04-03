# GUI Testing Policy

## Enforcement Mode
- `advisory`

## Smoke Routes
- No GUI smoke route is required for the current core repo because Delano is presently handbook- and script-driven.
- If a project introduces or changes `.delano/` UI surfaces, that project should add the routes and critical flows to exercise here or in project-specific context.

## Console Filtering
- Block browser/runtime errors for any UI surface that is introduced.
- Allow only documented, known development-only noise during local testing.

## Evidence Requirements
- Capture screenshots, console output, and comparison notes only for work that touches `.delano/` or other browser-visible surfaces.
- Script- and contract-only changes do not require GUI evidence.

## Design Validation Threshold
- For UI work, critical flows must render correctly, remain usable on supported viewports, and ship without blocked console errors.
- For non-UI work in this repo, this section is not a gating constraint.
