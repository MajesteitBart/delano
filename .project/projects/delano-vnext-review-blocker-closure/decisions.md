# Decisions: Delano vNext Review Blocker Closure

## 2026-05-04 - Use a focused blocker-closure project

Decision: create a separate project for unresolved vNext review blockers instead of reopening the umbrella vNext runtime upgrade project.

Rationale:
- The umbrella project is already marked complete, but several release-blocking issues remain.
- A focused project keeps blocker evidence and final closeout easy to audit.
- The scope can remain limited to privacy, package trust, contract alignment, validation, and CI.

## 2026-05-04 - Treat sync wording as handled but verify handbook consistency

Decision: do not create a standalone task for the review's sync-wording blocker because recent release-gate documents now describe dry-run and apply-gated behavior.

Rationale:
- The remaining handbook update task must still make that boundary visible in the canonical process document.
- This avoids duplicating a fixed blocker while still checking that the central handbook does not overclaim operational sync.

## 2026-05-04 - CI waits on local gate repair

Decision: add CI only after package drift and current test failures are repaired.

Rationale:
- CI should enforce passing gates.
- Adding CI before fixing known local failures would preserve a broken release signal.
