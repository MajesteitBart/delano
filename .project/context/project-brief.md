# Project Brief

## Problem
- Delano is both the product and the reference repository, so this repo needs real execution context inside `.project/context/`, not empty placeholders.
- The next delivery initiative is a first npm/CLI packaging layer that must wrap the existing runtime without breaking Delano's handbook-first, file-contract-first architecture.

## Target Outcome
- Keep this repository self-describing for maintainers and coding agents by documenting the actual product purpose, runtime boundaries, operating constraints, and current health.
- Stand up a handbook-compliant project outline for the v1 CLI packaging effort so execution can start from an approved spec, delivery plan, workstreams, and atomic tasks.

## Scope Boundaries
- In scope: repository context for Delano itself, the current canonical runtime model, and the planning/decomposition artifacts for the CLI packaging initiative.
- Out of scope: implementing the CLI in this setup pass, redefining Delano's core architecture, or changing adapter entrypoint behavior by default.
