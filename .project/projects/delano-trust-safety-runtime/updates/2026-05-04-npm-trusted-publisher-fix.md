---
name: npm trusted publisher package metadata fix
status: complete
created: 2026-05-04T12:30:00Z
updated: 2026-05-04T12:30:00Z
---

# Update: npm trusted publisher package metadata fix

## Context
GitHub Actions `npm publish --access public` reached npm trusted publishing and signed provenance, then failed with `E422` because `package.json` had an empty `repository.url`. npm expected the package metadata repository URL to match the GitHub repository from the provenance bundle: `https://github.com/MajesteitBart/delano`.

## Change
- Added exact npm provenance repository metadata to `package.json`.
- Removed `NODE_AUTH_TOKEN` from the publish step so trusted publishing uses OIDC instead of a long-lived npm token.
- Updated the README publishing instructions for npm trusted publisher setup.
- Extended `scripts/check-package-manifest-drift.mjs` to fail locally if trusted-publisher metadata drifts again.

## Evidence
- 2026-05-04: `npm run build:assets` rebuilt the package payload with 184 files.
- 2026-05-04: `npm run check:package-manifest` passed with the new trusted-publisher repository metadata check.
- 2026-05-04: `npm test` passed 51/51 tests.
- 2026-05-04: `bash .agents/scripts/pm/validate.sh` passed with 0 errors and 0 warnings.
