---
timestamp: 2026-07-01T10:15:00Z
status: done
task: T-012
stream: WS-D
---

# Progress Update

## Completed
- Replaced quote-matching annotation rendering with `@plannotator/web-highlighter` range metadata. New annotations persist `anchor.highlightSource` with `startMeta`, `endMeta`, selected text, and highlighter id, then restore highlights with `fromStore()`.
- Removed markdown-render-time `<mark>` injection so repeated text no longer causes every matching quote to highlight.
- Kept the yellow marker-style visual treatment on the highlighter wrapper class.
- Fixed `/api/doc` to return the already-validated repo-relative document path instead of recomputing metadata from a realpath, which prevented annotation loading/saving in Windows temp-root viewer runs.
- Browser evidence: temporary viewer fixture verified selecting the first repeated `target` occurrence produced one `.md-annotation-mark`; selecting across rendered `<strong>` markup produced three wrapper segments with combined text `crosses inline markup for `; saving, reopening the document, and restoring from persisted highlighter metadata reproduced the segmented highlight and drawer row.
- Validation passed: `npm --prefix .delano/viewer/ui run typecheck`.
- Validation passed: `npm --prefix .delano/viewer/ui run build`; existing AI SDK browser-externalization and chunk-size warnings remain.
- Validation passed: `npm --prefix .delano/viewer/ui run test:domain`.
- Validation passed: `node --test test\viewer-server.test.js`.
- Validation passed: `npm test`.
- Validation passed: `npm run build:assets`.
- Validation passed: `npm run check:package-manifest`.
- Validation passed: `bash .agents/scripts/pm/validate.sh`.

## In Progress
-

## Blockers
- None

## Next Actions
-
