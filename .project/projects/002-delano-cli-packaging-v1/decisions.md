# Decisions

## 2026-04-03: Keep v1 thin
- Context: The project brief explicitly rejects turning Delano into a full harness.
- Decision: `@bvdm/delano` will wrap existing scripts and package assets; it will not replace the shell/Python runtime in this phase.

## 2026-04-03: Install behavior is allowlist-driven and conflict-first
- Context: The desired npm install contract is narrower and safer than the current shell installer behavior.
- Decision: The package must install only the approved payload by default, abort on conflicts without `--force`, and avoid touching top-level adapter entry docs in the base install path.

## 2026-04-03: `.claude` remains compatibility-only
- Context: The repo's canonical runtime already lives in `.agents/`, and the brief forbids creating extra compatibility trees in base install.
- Decision: The CLI design may preserve future opt-in compatibility support, but the normal v1 base install will not treat `.claude` as canonical runtime content.

## 2026-04-28: Close local packaging work with publish access deferred
- Context: Package implementation, install behavior, docs, tests, asset build, and dry-run packaging are verified locally. A prior `npm publish --access public` attempt failed because this environment lacks publish permission for the `@bvdm` scope.
- Decision: Close the local delivery project as complete and track npm publish access as an external release follow-up rather than an implementation blocker.

## 2026-05-04: Publish from GitHub Actions
- Context: Local `npm publish --access public` reached npm's one-time-password browser flow, leaving the corrected release dependent on a manual publish from the maintainer PC.
- Decision: Use GitHub Actions trusted publishing for `@bvdm/delano` through `.github/workflows/publish-npm.yml`, with local package gates run in CI before publication.
