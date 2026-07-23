---
timestamp: 2026-07-06T12:24:47Z
status: done
task: T-013
stream: WS-C
---

# Progress Update

## Completed
- Review fixes: hardened annotation store parse failures, oversized/malformed request body handling, apply-before-audit ordering, markdown heading/code/task rendering, stale document annotation state, same-highlight edit preservation, and clipboard/download handling.
- Contract and guidance cleanup: removed stale embedded-chat loopfile rows, corrected table-pagination update traceability, aligned T-004 updated metadata with its latest evidence, refreshed AI SDK/shadcn skill guidance in `.agents`, and regenerated the `.claude` mirror.
- Follow-up viewer polish: document Back now returns to the previous non-document route, duplicate reader eyebrow/title chrome was removed so the markdown H1 owns the document heading, and the handover menus were widened/reworked into compact command-menu groups.
- Validation passed: `node --check .delano/viewer/server.js`; `node --test test/viewer-server.test.js` (7/7); `npm --prefix .delano/viewer/ui run test:domain`; `npm --prefix .delano/viewer/ui run typecheck`; `npm --prefix .delano/viewer/ui run build`; `npm run build:assets`; `npm run check:package-manifest`; `npm run check:claude-mirror`; `npm run check:agent-entry-docs`; `node bin/delano.js validate` (0 errors, 0 warnings).
- Validation caveats: full `npm test` still fails in three package tests because this Windows/WSL environment cannot execute `/bin/bash`; `npm --prefix .delano/viewer/ui run lint` still reports eight pre-existing React lint rule violations outside the newly edited navigation/menu paths.

## In Progress
- None.

## Blockers
- None.

## Next Actions
- Run focused server/UI validation, mirror parity, package manifest checks, and Delano validation.
