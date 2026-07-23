# Delano v0.2.0 Release Gates

These gates define the local checks required before cutting Delano v0.2.0 from the vNext runtime upgrade work.

## Must-have v0.2 gates

1. **Project/runtime validation passes**
   - Run: `bash .agents/scripts/pm/validate.sh`
   - Must pass with `Errors: 0`.

2. **Package/runtime tests pass**
   - Run: `npm test`
   - Must pass all package and runtime tests.

3. **Package payload is rebuilt and in sync**
   - Run: `npm run build:assets`
   - Run: `npm run check:package-manifest`
   - `assets/install-manifest.json` must match the generated runtime payload allowlist.

4. **Privacy-safe logging remains default**
   - Covered by PM validation and `check-log-safety`.
   - Raw prompt text must remain opt-in only.

5. **Contract enforcement gates remain green**
   - Artifact scope/schema checks pass.
   - Operating mode checks pass.
   - Status-transition validation passes.
   - Acceptance/evidence mapping validation passes.
   - Strict fixtures pass.

6. **Dry-run sync and repair behavior remains non-mutating**
   - Local sync map, GitHub/Linear inspection, drift report, and repair plan checks pass.
   - Apply posture remains blocked without explicit approval.

7. **Multi-agent coordination gates remain green**
   - Lease contract, lease manager, conflict-zone, stream selection, handoff, and worktree-health checks pass.

8. **Learning loop/eval gates remain green**
   - Delivery metric schemas/checks pass.
   - Project metrics summaries stay privacy-safe.
   - Context audit checks pass.
   - Skill output eval fixtures pass.
   - Closeout learning proposal workflow remains review-gated before adoption.

9. **Agent entry docs stay compact and outcome-first**
   - `AGENTS.md` contains the shared first-turn workflow, source-of-truth map, commands, completion rule, and safety boundaries.
   - `CODEX.md`, `CLAUDE.md`, `OPENCODE.md`, and `PI.md` remain thin adapter pointers.

## Later maturity gates

These are intentionally deferred beyond v0.2.0:

- Remote GitHub/Linear writes beyond explicit dry-run and apply-gated repair planning.
- Full portfolio/dashboard surfaces.
- Enterprise-grade state-machine/runtime orchestration.
- Non-mocked Linear API behavior beyond local fixture inspection.

GitHub Actions now owns npm publication through `.github/workflows/publish-npm.yml` after the npm package is configured for trusted publishing.

## Current verification command list

```bash
npm run build:assets
npm run check:package-manifest
bash .agents/scripts/pm/validate.sh
npm test
```

A release candidate is not ready if any command fails, if task evidence is missing for newly done work, or if the working tree contains unexplained changes.
