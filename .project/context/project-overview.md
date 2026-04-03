# Project Overview

## Mission
- Delano is an agent-agnostic delivery system that turns outcomes into specs, plans, tasks, execution evidence, and learnings through shared file contracts and runtime scripts.
- This repository is the canonical source for the handbook, runtime, templates, and reference install path used when Delano is adopted in other repositories.

## Active Delivery Scopes
- `handbook-theo-method-upgrade` is complete and established the `.agents`-first, probe-aware operating model.
- `delano-cli-packaging-v1` is the next planned scope: add a thin npm CLI and packaging layer around the existing runtime without turning Delano into a harness.

## Current Health
- Canonical runtime and contract structure are present and `bash .agents/scripts/pm/validate.sh` passes in this environment.
- `.agents/` is the canonical runtime tree. `.claude/` exists in this repo as a directory mirror with matching contents, not as a symlink.
- The primary current gap was context quality rather than missing runtime pieces; the context pack should now be maintained as execution memory, not treated as boilerplate.
