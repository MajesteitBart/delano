# Delano artifact schema scope

This directory defines the first contract surface for Delano project artifacts.

`artifact-scope.json` is intentionally a scope contract, not the final validator schema. It answers which artifacts are in scope, which fields are required or optional, which fields should become enum-constrained, and which values can be derived by tooling later.

## In scope for the first schema pass

- Project specs
- Project plans
- Workstreams
- Tasks
- Decision logs
- Updates
- Context documents
- Evidence records in task logs or update files

## Validation posture

The scope contract is additive and local-first. Existing validation still runs through `bash .agents/scripts/pm/validate.sh`; schema-specific validation starts as a dry-run check with `npm run check:artifact-scope` before stricter enforcement is added.
